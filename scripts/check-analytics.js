import fs from 'fs';
import path from 'path';

// Configuration
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const API_BASE_URL = 'https://vercel.com/api';

// Validate environment variables
if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
  console.error('エラー: 環境変数が未設定です');
  console.error('以下を設定してください:');
  console.error('  - VERCEL_TOKEN: Vercel API トークン');
  console.error('  - VERCEL_PROJECT_ID: Vercel プロジェクト ID');
  process.exit(1);
}

/**
 * Get UTC date range for a specific day
 * @param {Date} date - The date to get range for
 * @returns {Object} Object with from and to timestamps (milliseconds)
 */
function getDateRange(date) {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);

  return {
    from: start.getTime(),
    to: end.getTime()
  };
}

/**
 * Get ISO string for a date in JST (UTC+9)
 * @param {Date} date - The date to format
 * @returns {string} ISO string in JST format
 */
function formatJST(date) {
  const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return jstDate.toISOString().split('T')[0];
}

/**
 * Get current time in JST format
 * @returns {string} Current time in HH:MM format JST
 */
function getCurrentTimeJST() {
  const now = new Date();
  const jstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const hours = String(jstDate.getUTCHours()).padStart(2, '0');
  const minutes = String(jstDate.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Fetch analytics data from Vercel API
 * @param {string} endpoint - The API endpoint path
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} The API response
 */
async function fetchAPI(endpoint, params = {}) {
  const url = new URL(`${API_BASE_URL}${endpoint}`);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status !== 200) {
      const errorText = await response.text();
      throw new Error(`APIエラー (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`ネットワークエラー: ${error.message}`);
  }
}

/**
 * Get page view statistics for a date range
 * @param {number} from - Start timestamp (ms)
 * @param {number} to - End timestamp (ms)
 * @returns {Promise<number>} Page view count
 */
async function getPageViews(from, to) {
  try {
    const data = await fetchAPI('/v1/analytics', {
      projectId: VERCEL_PROJECT_ID,
      from: from,
      to: to,
      environment: 'production'
    });

    // Handle different possible response structures
    if (data.pageViews !== undefined) {
      return data.pageViews;
    } else if (data.data && data.data.pageViews !== undefined) {
      return data.data.pageViews;
    } else if (data.analytics && Array.isArray(data.analytics)) {
      return data.analytics.reduce((sum, item) => sum + (item.pageViews || 0), 0);
    }

    return 0;
  } catch (error) {
    console.warn(`取得不可 (PV統計): ${error.message}`);
    return null;
  }
}

/**
 * Get referrer statistics
 * @param {number} from - Start timestamp (ms)
 * @param {number} to - End timestamp (ms)
 * @returns {Promise<Array>} Array of {referrer, count} objects
 */
async function getReferrers(from, to) {
  try {
    const data = await fetchAPI('/v1/insights/referrers', {
      projectId: VERCEL_PROJECT_ID,
      from: from,
      to: to
    });

    // Handle different possible response structures
    let referrers = [];

    if (Array.isArray(data)) {
      referrers = data;
    } else if (data.referrers && Array.isArray(data.referrers)) {
      referrers = data.referrers;
    } else if (data.data && Array.isArray(data.data)) {
      referrers = data.data;
    }

    return referrers
      .map(item => ({
        name: item.referrer || item.name || 'unknown',
        count: item.count || item.views || 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  } catch (error) {
    console.warn(`取得不可 (参照元): ${error.message}`);
    return [];
  }
}

/**
 * Get top pages statistics
 * @param {number} from - Start timestamp (ms)
 * @param {number} to - End timestamp (ms)
 * @returns {Promise<Array>} Array of {path, count} objects
 */
async function getTopPages(from, to) {
  try {
    const data = await fetchAPI('/v1/insights/top-pages', {
      projectId: VERCEL_PROJECT_ID,
      from: from,
      to: to
    });

    // Handle different possible response structures
    let pages = [];

    if (Array.isArray(data)) {
      pages = data;
    } else if (data.pages && Array.isArray(data.pages)) {
      pages = data.pages;
    } else if (data.data && Array.isArray(data.data)) {
      pages = data.data;
    }

    return pages
      .map(item => ({
        path: item.path || item.page || 'unknown',
        count: item.count || item.views || 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  } catch (error) {
    console.warn(`取得不可 (ページ): ${error.message}`);
    return [];
  }
}

/**
 * Format value for display (use "取得不可" if null)
 * @param {number|null} value - The value to format
 * @returns {string} Formatted value
 */
function formatValue(value) {
  return value === null ? '取得不可' : String(value);
}

/**
 * Main function to generate analytics report
 */
async function main() {
  try {
    console.log('アナリティクスデータを取得中...');

    const now = new Date();
    const today = new Date(now);
    today.setUTCHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    // Get Monday of this week (UTC)
    const monday = new Date(today);
    const dayOfWeek = monday.getUTCDay();
    const diff = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
    monday.setUTCDate(monday.getUTCDate() + diff);

    // Fetch analytics data in parallel
    const [todayPV, yesterdayPV, weekPV, referrers, topPages] = await Promise.all([
      getPageViews(today.getTime(), now.getTime()),
      getPageViews(yesterday.getTime(), new Date(yesterday.getTime() + 24 * 60 * 60 * 1000).getTime()),
      getPageViews(monday.getTime(), now.getTime()),
      getReferrers(today.getTime(), now.getTime()),
      getTopPages(today.getTime(), now.getTime())
    ]);

    // Format the report
    const date = formatJST(now);
    const time = getCurrentTimeJST();
    const timestamp = `${date} ${time} JST`;

    let report = `## ${timestamp}\n\n`;

    // Metrics table
    report += '| 指標 | 値 |\n';
    report += '|------|-----|\n';
    report += `| 今日のPV | ${formatValue(todayPV)} |\n`;
    report += `| 昨日のPV | ${formatValue(yesterdayPV)} |\n`;
    report += `| 今週合計PV | ${formatValue(weekPV)} |\n\n`;

    // Top referrers
    report += '### 上位参照元\n';
    if (referrers.length > 0) {
      referrers.forEach(ref => {
        report += `- ${ref.name}: ${ref.count}\n`;
      });
    } else {
      report += '- データなし\n';
    }
    report += '\n';

    // Top pages
    report += '### 上位ページ\n';
    if (topPages.length > 0) {
      topPages.forEach(page => {
        report += `- ${page.path}: ${page.count}\n`;
      });
    } else {
      report += '- データなし\n';
    }

    report += '\n---\n\n';

    // Ensure output directory exists
    const outputDir = '/Users/kaito1661/Desktop/dev/mystery-site/output';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Append to analytics report
    const reportPath = path.join(outputDir, 'analytics-report.md');
    fs.appendFileSync(reportPath, report, 'utf8');

    console.log(`レポートを保存しました: ${reportPath}`);
    console.log('');
    console.log('取得したデータ:');
    console.log(`  今日のPV: ${formatValue(todayPV)}`);
    console.log(`  昨日のPV: ${formatValue(yesterdayPV)}`);
    console.log(`  今週合計PV: ${formatValue(weekPV)}`);
    console.log(`  参照元: ${referrers.length}件`);
    console.log(`  トップページ: ${topPages.length}件`);

  } catch (error) {
    console.error(`エラーが発生しました: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main();

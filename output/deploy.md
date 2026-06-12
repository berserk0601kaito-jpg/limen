# LIMEN — デプロイ手順

---

## 初回セットアップ

### 1. GitHubリポジトリ作成

```bash
cd mystery-site
git add .
git commit -m "initial"
gh repo create limen --private --source=. --push
```

### 2. Vercel プロジェクト作成

```bash
cd site
npm install
vercel
```

プロンプトへの回答:
- Root directory: `site`
- Framework: Next.js
- Build command: `next build`（デフォルト）

### 3. 環境変数の設定

Vercelダッシュボード → Settings → Environment Variables:

| 変数名 | 値 | 用途 |
|-------|-----|------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Claude API |
| `CRON_SECRET` | 任意の長い文字列 | Cron認証 |

GitHub Secrets（Settings → Secrets → Actions）:

| シークレット名 | 値 |
|-------------|-----|
| `ANTHROPIC_API_KEY` | `sk-ant-...` |

### 4. Vercel × GitHub 連携

Vercelダッシュボード → Git → GitHubリポジトリを連携  
→ main ブランチへのpushで自動デプロイが有効になる

### 5. ドメイン設定（任意）

```
limen.day / limen.fyi / limen.run
```

Vercelダッシュボード → Domains → カスタムドメイン追加  
DNSにVERCEL-DNS-01 TXTレコードを追加

---

## 動作確認

デプロイ後に確認:

```bash
# 今日のシグナルが表示されるか
curl https://your-domain.vercel.app/

# アーカイブが表示されるか
curl https://your-domain.vercel.app/archive

# Cron手動テスト
curl -X POST https://your-domain.vercel.app/api/generate \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## 更新フロー

```
GitHub Actions (UTC 15:00)
  ↓
scripts/generate-daily.js
  ↓
content/2026-XX-XX.json 追加
  ↓
git push → Vercel 自動デプロイ（約30秒）
  ↓
limen.day が更新される
```

---

## ロールバック

特定日のコンテンツを差し替える場合:

```bash
# content/2026-07-04.json を手動編集
# world-bible.md のルールを必ず確認してから編集
git add content/2026-07-04.json
git commit -m "signal 2026-07-04"
git push
# Vercel が自動再デプロイ
```

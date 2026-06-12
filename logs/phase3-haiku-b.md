# Phase 3 Implementation Log — Haiku 4.5

**Date:** 2026-06-12  
**Task:** Auto-generation system for LIMEN daily signals  
**Model:** Claude Haiku 4.5

---

## Summary

Implemented a complete daily signal generation system that:
- Calls Claude Opus 4.8 daily at UTC 15:00 (JST 0:00)
- Generates LIMEN signals following strict world-bible rules
- Persists signals to JSON files
- Auto-deploys via GitHub Actions
- Provides a Vercel API endpoint for on-demand generation

---

## Files Created

### 1. `/scripts/package.json`
- Node.js module configuration with ES modules enabled
- Dependencies: `@anthropic-ai/sdk@^0.39.0`

### 2. `/scripts/generate-daily.js`
- **Purpose:** CLI script to generate and save daily signals
- **Key features:**
  - Parses optional date argument (defaults to today)
  - Calculates sequence number from epoch (2026-06-12 = 0001)
  - Loads existing signals from `content/seeds.json` to extract:
    - Previous day's texture (for rotation rule)
    - Used colors (to prevent duplicates)
  - Calls Claude Opus 4.8 with:
    - System prompt distilled from world-bible.md
    - User prompt with date, sequence, previous texture, used colors
  - Validates response JSON shape
  - Saves to `content/YYYY-MM-DD.json`
  - Skips generation if signal already exists
  - Full error logging with exit codes

**Usage:**
```bash
cd scripts && node generate-daily.js [YYYY-MM-DD]
```

### 3. `/site/app/api/generate/route.ts`
- **Purpose:** Vercel Cron Functions endpoint
- **Endpoint:** `POST /api/generate`
- **Authentication:** Bearer token via `CRON_SECRET` environment variable
- **Key features:**
  - Validates incoming request with CRON_SECRET
  - Same signal generation logic as CLI script
  - Handles filesystem limitations:
    - Attempts local file save (works in development)
    - Gracefully degrades in production (read-only filesystem)
    - Logs recommendations for production (Vercel KV, GitHub API, databases)
  - Includes GET endpoint for manual testing (protected by same auth)
  - Returns JSON with full signal data

**Deployment note:** On Vercel (read-only filesystem), this endpoint will log the generated signal but cannot persist locally. For production, implement one of:
- **Vercel KV** (Redis): `process.env.KV_REST_API_URL`
- **GitHub API**: Commit directly to repository
- **External DB**: Supabase, PlanetScale, etc.

### 4. `/.github/workflows/daily-generate.yml`
- **Trigger:** Cron schedule `0 15 * * *` (UTC 15:00 = JST 0:00)
- **Alternative:** Manual trigger via `workflow_dispatch`
- **Steps:**
  1. Checkout code with full history
  2. Setup Node 20
  3. Install Anthropic SDK in scripts/ directory
  4. Run `scripts/generate-daily.js`
  5. Commit new signal and push to main branch
  6. Gracefully handles "no changes" case (signal already exists)
- **Secrets required:** `ANTHROPIC_API_KEY`

### 5. `/site/package.json` (Updated)
- Added `@anthropic-ai/sdk@^0.39.0` to dependencies
- Allows API route to import Anthropic client

---

## Implementation Details

### Sequence Calculation
```javascript
daysSinceEpoch = Math.floor((targetDate - EPOCH_DATE) / 86400000)
sequence = (daysSinceEpoch + 1).toString().padStart(4, '0')
```
- Epoch: 2026-06-12
- 2026-06-12 = 0001
- 2026-06-13 = 0002
- Etc.

### Signal Generation Flow
1. Load existing signals from `content/seeds.json`
2. Extract previous day's texture (alternates through 7 textures)
3. Extract used colors (prevents hex duplication)
4. Call Claude Opus 4.8 with system + user prompts
5. Validate JSON response (all 5 fields required)
6. Save to `content/YYYY-MM-DD.json`
7. Log success or error

### Error Handling
- **CLI script:** Logs errors to stdout and exits with code 1 on failure
- **API endpoint:** Returns HTTP 500 with error details
- **Duplicate detection:** Gracefully skips if signal already exists for the date
- **Missing env vars:** Fails fast with clear error messages

### Texture Rotation
- 7 textures defined in `world-bible.md` section 3.4
- Automatically rotates to ensure no two consecutive days share a texture
- Derived from signal count modulo 7

### Color Tracking
- All previous colors loaded from `content/seeds.json`
- Passed to Claude as `used_colors` array
- Claude instructed to avoid duplicates within #000000–#4A4A6A range

---

## Environment Variables

### Required

| Variable | Service | Scope | Example |
|----------|---------|-------|---------|
| `ANTHROPIC_API_KEY` | Claude API | GitHub Secrets + local dev | `sk-ant-...` |
| `CRON_SECRET` | Vercel API auth | Vercel env vars | Generate strong random string |

### Optional (Production optimization)
| Variable | Service | Purpose |
|----------|---------|---------|
| `KV_REST_API_URL` | Vercel KV | Alternative storage (production) |
| `KV_REST_API_TOKEN` | Vercel KV | Alternative storage (production) |
| `GITHUB_TOKEN` | GitHub API | Direct commit to repo (production) |

---

## Configuration Checklist

### Local Development
```bash
# 1. Install dependencies
cd /Users/kaito1661/Desktop/dev/mystery-site/scripts
npm install

# 2. Set API key
export ANTHROPIC_API_KEY="sk-ant-..."

# 3. Test script
node generate-daily.js

# 4. Test with specific date
node generate-daily.js 2026-07-01
```

### GitHub Actions
```
Settings → Secrets and variables → Actions
Add: ANTHROPIC_API_KEY = sk-ant-...
```

### Vercel Deployment
```
Vercel dashboard → Project settings → Environment variables
Add: ANTHROPIC_API_KEY = sk-ant-...
Add: CRON_SECRET = (strong random string, 32+ chars)
```

### Enable Cron Functions
```
vercel.json: Add "crons" configuration if needed, or
Vercel dashboard → Functions → Enable Cron Functions
```

---

## File Locations Summary

```
/Users/kaito1661/Desktop/dev/mystery-site/
├── scripts/
│   ├── package.json
│   └── generate-daily.js
├── site/
│   ├── package.json (updated)
│   └── app/
│       └── api/
│           └── generate/
│               └── route.ts
├── .github/
│   └── workflows/
│       └── daily-generate.yml
└── content/
    ├── seeds.json (existing, will receive new signals)
    └── YYYY-MM-DD.json (new files created daily)
```

---

## Testing Strategy

### Unit Testing
```bash
# Test sequence calculation for known dates
node scripts/generate-daily.js 2026-06-12  # Should output 0001
node scripts/generate-daily.js 2026-06-13  # Should output 0002
node scripts/generate-daily.js 2026-07-12  # Should output 0031
```

### Integration Testing
```bash
# Test API endpoint locally
curl -X POST http://localhost:3000/api/generate \
  -H "Authorization: Bearer {CRON_SECRET}" \
  -H "Content-Type: application/json"
```

### Full Workflow Testing
1. Manual trigger on GitHub Actions (via workflow_dispatch)
2. Verify signal generation in logs
3. Confirm new file in content/
4. Check commit was pushed to main

---

## Known Limitations & Future Improvements

### Current Limitations
1. **Filesystem persistence:** API route attempts local save, which fails on Vercel
2. **Texture tracking:** Inferred from sequence count, not stored explicitly
3. **No idempotency token:** Multiple requests within same minute could cause race conditions

### Recommended Production Changes
1. **Storage:** Switch from filesystem to Vercel KV or database
2. **Explicit texture field:** Add `texture` to signal JSON for clarity
3. **Distributed locking:** Use Redis/KV to prevent concurrent writes
4. **Observability:** Integrate with Sentry or Datadog for error tracking
5. **Signal backup:** Archive to S3 or GCS for durability
6. **Rate limiting:** Protect API endpoint from abuse

---

## Verification

✅ Files created as specified  
✅ Environment variables documented  
✅ Error handling implemented  
✅ Duplicate detection in place  
✅ Claude API integration with Opus 4.8  
✅ GitHub Actions workflow scheduled  
✅ Vercel API Route with auth  
✅ Sequence calculation verified  
✅ Logging implemented  
✅ World-bible rules embedded in prompts  

---

**Generated by:** Claude Haiku 4.5  
**Timestamp:** 2026-06-12T21:30:00Z

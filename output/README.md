# LIMEN — 運用手順

---

## 日次運用

毎日0:00 JSTに GitHub Actions が自動実行される。

```
UTC 15:00 → GitHub Actions起動
  → scripts/generate-daily.js 実行
    → Claude API (Opus 4.8) でシグナル生成
    → content/YYYY-MM-DD.json に保存
    → git commit & push
      → Vercel が自動デプロイ
```

手動で実行する場合:
```bash
cd mystery-site
ANTHROPIC_API_KEY=sk-... node scripts/generate-daily.js
# または特定日付を指定:
node scripts/generate-daily.js 2026-07-01
```

---

## コンテンツ構造

```
content/
├── seeds.json          # Day 0001〜0030（起動時の30日分）
└── YYYY-MM-DD.json     # 日次生成ファイル（scripts/が書き込む）
```

各シグナルの形式:
```json
{
  "date": "2026-06-12",
  "sequence": "0001",
  "number": "94712",
  "fragment": "—still losing altitude when the windows began to",
  "color": "#2C1854"
}
```

---

## スポンサードシグナル

通常シグナルに以下フィールドを追加するだけ:
```json
{
  "date": "2026-06-20",
  "sequence": "0009",
  "number": "73841",
  "fragment": "the texture of something not yet given a name",
  "color": "#1C2440",
  "sponsored": true,
  "sponsorUrl": "https://sponsor.example.com"
}
```

- 見た目は通常シグナルと同一
- ホバー時のみ右下に `◈` が出現（opacity 0→0.3）
- 月4回以内を推奨

---

## 世界観チェックリスト（コンテンツ変更時）

- [ ] fragmentは7〜12語か
- [ ] fragmentは完結した文になっていないか
- [ ] "I", "me", "you", "she", "he" が含まれていないか
- [ ] colorは #000〜#4a4a6a の範囲内か
- [ ] numberは5桁か、パターンがないか
- [ ] 連続する日でtextureが被っていないか
- [ ] 説明的な文言がコードに入っていないか

詳細は `world-bible.md` を参照。

---

## 緊急時の手動デプロイ

```bash
cd mystery-site/site
npm run build
vercel --prod
```

---

## ディレクトリ構成

```
mystery-site/
├── CLAUDE.md           # 組織ルール
├── site-spec.md        # 設計書
├── world-bible.md      # 世界観バイブル（最重要）
├── prompts/
│   └── daily-generator.md  # Opus呼び出しテンプレート
├── content/            # シグナルデータ
├── scripts/            # 自動生成スクリプト
├── site/               # Next.jsアプリ
├── .github/workflows/  # GitHub Actions
├── logs/               # 各フェーズの作業ログ
└── output/             # 本ドキュメント群
```

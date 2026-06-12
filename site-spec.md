# SITE-SPEC — LIMEN

*Classified: Internal Use Only. Do not share outside the organization.*

---

## サイト名

**LIMEN**

ラテン語で「敷居」「閾（しきい）」を意味する。  
関連語: liminal（リミナル）— 移行の、境界の。  
発音は「ライメン」とも「リメン」とも読める。どちらが正しいかは示さない。  
ドメイン候補: `limen.day` / `limen.fyi` / `limen.run`

---

## 毎日更新されるコンテンツ形式

### シグナル構造（1日1件）

各日のコンテンツは「シグナル」と呼ぶ。以下の4要素で構成される。

```json
{
  "date": "2026-06-12",
  "sequence": "0031",
  "number": "94712",
  "fragment": "—still losing altitude when the windows",
  "color": "#2C1854"
}
```

| フィールド | 説明 | 生成ルール |
|-----------|------|-----------|
| `sequence` | 累積カウンター（0031など） | 起動日を Day 0 とし加算 |
| `number` | 5桁の数値 | 理由不明。説明しない |
| `fragment` | 7〜12語の断片 | 文の途中から始まるか途中で終わる |
| `color` | 16進カラーコード | 冷たく暗い色域: #000〜#4a4a6a |

### 表示レイアウト（1日1画面）

```
                    0031


              94712


    —still losing altitude when the windows


                  #2C1854
```

- 中央揃え、縦方向にも中央
- 背景: ほぼ黒 (#0a0a0a)
- フォント: モノスペース、細字
- アニメーション: なし。ただしページ読み込み時に各要素が0.4秒ずつフェードイン
- 音: なし

---

## ディレクトリ構成

```
mystery-site/
├── CLAUDE.md
├── site-spec.md
├── world-bible.md
├── prompts/
│   └── daily-generator.md
├── content/
│   ├── seeds.json              # 最初の30日分
│   └── YYYY-MM-DD.json         # 日次生成ファイル
├── scripts/
│   ├── generate-daily.js       # Opus API呼び出し → content保存
│   └── deploy.sh               # Vercelデプロイトリガー
├── site/                       # Next.jsアプリ本体
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # 今日のシグナル表示
│   │   ├── archive/
│   │   │   └── page.tsx        # 過去ログ一覧
│   │   └── api/
│   │       └── signal/
│   │           └── route.ts    # /api/signal?date=YYYY-MM-DD
│   ├── lib/
│   │   └── content.ts          # JSONロードユーティリティ
│   ├── public/
│   ├── package.json
│   └── vercel.json             # Cron設定
├── logs/
│   ├── phase1-president.md
│   ├── phase2-opus.md
│   ├── phase3-haiku-a.md
│   ├── phase3-haiku-b.md
│   └── phase3-haiku-c.md
└── output/
    ├── README.md
    ├── deploy.md
    └── launch-strategy.md
```

---

## 技術スタック

| レイヤー | 選択 | 理由 |
|---------|------|------|
| フレームワーク | Next.js 14+ (App Router) | Vercelとの親和性、静的生成 |
| 言語 | TypeScript | 型安全性 |
| スタイリング | Tailwind CSS (カスタムテーマ) | 最小CSS、暗色系テーマ |
| ホスティング | Vercel | Cron Functions、CDN、ゼロ設定デプロイ |
| コンテンツ生成 | Claude API (Opus 4.8) | 世界観に忠実な生成 |
| スケジューリング | Vercel Cron Functions | 毎日0:00 JST |
| バージョン管理 | GitHub | Vercelと連携 |

### Vercel Cron設定 (vercel.json)
```json
{
  "crons": [{
    "path": "/api/generate",
    "schedule": "0 15 * * *"
  }]
}
```
*UTC 15:00 = JST 0:00*

---

## 広告掲載エリアの設計

### 哲学

世界観を壊す広告は置かない。広告を「シグナルの異常」として埋め込む。

### 実装仕様

```
通常シグナル:     0031 / 94712 / fragment / #2C1854
スポンサーシグナル: 0031 / 94712 / fragment / #2C1854  ← 見た目は同一
```

- HTMLに `data-signal-type="sponsored"` 属性を付与（不可視）
- ホバー時のみ、画面右下に `◈` が0.3秒だけ表示される
- クリックするとスポンサーURLへ遷移（新しいタブ）
- 出現頻度: 最大週1回
- fragmentがスポンサーのトーンで生成される（ただし説明的にしない）
- 例: ブランドXなら「—the texture of something not yet named」のような詩的断片

### 広告管理API（将来実装）

```
POST /api/admin/sponsor
{
  "brand": "X",
  "dates": ["2026-06-20"],
  "tone_hint": "minimalist, architectural, slow"
}
```

---

## 社長判断: コスト規律

- Phase 2はOpus必須（世界観の核心）
- Phase 3はHaiku（実装のみ、判断不要）
- 日次生成はOpus（品質維持のため妥協しない）
- Phase 4はOpus（世界観チェックはHaikuに任せない）

---

*Phase 1 完了 — 2026-06-12*

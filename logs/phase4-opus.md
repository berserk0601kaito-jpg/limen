# Phase 4 品質チェックレポート — Opus

Date: 2026-06-12
Reviewer: Opus 4.8 (Creative Executive)
照合対象: `world-bible.md` / `content/seeds.json` / `site/app/*`

---

## seeds.json 検証結果

プログラムで30日分を機械検証（word count / person / punctuation / color range / number / texture adjacency）。

- **fragment重複**: なし。30件すべてユニーク。
- **word count（7〜12語）**: 全件合格。Day 0001と0008が8語、他は9語。範囲内だが「ほぼ全部9語」で揺らぎが乏しい。リズムの単調化リスクとして要注意（後述・軽微）。
- **terminal punctuation**: なし。ピリオド・感嘆・疑問符で閉じるfragmentはゼロ。合格。
- **第三人称（重大）**: **Day 0019 に "she" が混入** — `another hallway behind the one she thought was the`。world-bible §2.2 / §8-5は一人称・二人称を禁じるが、§2.2は「named people」「overheard, not spoken」を要求し、§8-9は固有の人物を禁止。"she"は語り手不在の冷静な計器という核心トーンを壊す唯一の人称代名詞。**要修正。** ("them" がDay 0004/0011にあるが、これは禁止リスト外で問題なし。)
- **texture連続違反**: なし。ただし配列が `altitude→water→cold→counting→architecture→absence→light` の7周期を3回そっくり反復する完全な周期構造。「隣接日同一禁止」の文字規則は満たすが、§3.4の「one mood repeatedにならない」精神に対し、観察力のある訪問者が周期を逆算できる懸念。§6/§8-8が numberに課す「forensic attentionで構造を悟らせない」思想と整合させるなら、序列をシャッフルすべき（軽微）。
- **color重複**: なし。30色すべてユニークhex。合格。
- **color範囲**: 全件 `#000000`〜`#4a4a6a` の冷色域内。暖色（r>b）・上限超過の明るさ なし。合格。
- **number**: 全件5桁・先頭ゼロなし・重複なし・可視パターンなし・date/sequenceとの導出関係なし。合格。

---

## コード世界観チェック

### 違反項目（修正必要）

1. **Server ComponentでのJSXイベントハンドラ（最重要・ビルド破壊）**
   `site/app/page.tsx` 85–90, 106–111行 と `site/app/archive/page.tsx` 32–37行で
   `onMouseEnter` / `onMouseLeave` を使用。両ファイルとも `'use client'` がなくServer Component。
   App RouterではServer Componentにイベントハンドラを渡せず、ビルド/レンダー時にエラー。
   **修正指示**: ホバーで現れるinteractive要素（◈ / ◦ / ← back）を `'use client'` 付きの小さなClient Componentに分離する。あるいはイベントハンドラを廃し、純CSS `:hover` に置換（globals.cssに既に `.sponsor-indicator` 用のCSSホバーが存在するので、JSハンドラと二重管理になっている — CSS側に一本化が望ましい）。

2. **archiveページが日付以外も表示**
   仕様（社長指示）は「日付だけ表示、タイトルなし」。
   `site/app/archive/page.tsx` は各行で sequence(78) / date(87) / number(99) / fragment(111) / color(121) を全表示。
   特に **fragment全文の一覧表示は世界観上も危険** — 過去signalを並べると「微小フィクション集」に見え、§0「instrument that was left running」「謎にとどめる」という核を崩す。
   **修正指示**: archiveは `date`（または `sequence`）のみの簡素なリストにする。number/fragment/colorは出さない。

3. **「no signals」テキスト（world-bible §8-1違反）**
   `archive/page.tsx` 127–139行。説明的テキストはサイト上に置けない（§8-1「no captions」）。
   **修正指示**: 空配列時は何もレンダーしない（`null`）。プレースホルダ文言を削除。

### 軽微な問題（推奨修正）

- **「← back」テキスト（説明的）**: `archive/page.tsx` 39行。社長仕様は文字 `◂` のみ。「back」という語はブランドボイス/説明寄りで §2.2・§8-1の精神に反する。`◂`（または page.tsx 既存の `◦` 系記号）に置換。
- **fontWeight: "bold"**: `page.tsx` 37行（number）、`archive/page.tsx` 94行（number）。world-bibleは計器/臨床美学であり「細字」想定。`300`（light）か `400`（normal）へ。boldは主張が強すぎ「冷静な声」を損なう。
- **fontStyle: "italic"**: `page.tsx` 55行（fragment）、`archive/page.tsx` 107行（fragment）。world-bibleにitalic指定なし。instrument/clinicalトーンには `normal` が適切。イタリックは「引用・感情」を示唆し、§4「overheard, not offered」の中立性を弱める。
- **globals.css `overflow: hidden`**: 8–17行で `html, body` に適用。日次signalページ（1画面完結）には正しいが、**archiveが将来スクロールを要する場合に内容が切れる**。現状はseeds 30件で `minHeight:100vh` を超えるため実害あり。archive側で `overflow` を上書きするか、bodyのhidden適用をトップページscopeに限定。
- **fragmentの語数偏り（seeds）**: ほぼ全件9語。§3.1は7〜12語を許すので違反ではないが、リズムが均質化している。今後の生成で語数に揺らぎを持たせる方針を generator prompt に追記推奨。
- **texture周期の規則性（seeds）**: 上記の通り完全周期。今後30日ぶんを追加する際はシャッフルし、周期逆算を防ぐ。

### 合格項目

- color: 全件冷色域内・重複なし（§5, §8-7）。
- number: 5桁・パターンなし・date/sequence非連動・重複なし（§6, §8-8）。
- fragment語数: 全件7〜12語内（§3.1）。
- fragment文法: 全件、句点で閉じず途中で開始/終了。完結文なし（§3.2, §8-4）。
- fragment重複なし。
- texture隣接: 連続2日同一なし（§3.4, §8-11）— 文字規則は満たす。
- ホラーゴア/超自然名詞/ユーモア/ブランド言及: fragment本文には混入なし（§8-9,10）。
- layout.tsx: `<title>LIMEN</title>` のみで説明メタなし。可（内部名であり本文露出ではない）。
- 日次ページ構成: 5フィールド（sequence/number/fragment/color + sponsor/archive記号）のみ。説明文なし（§1, §8-1）。
- sponsor指標 `◈` / archive `◦`: 記号のみ・通常opacity 0でホバー時のみ薄く出現 — §8-3「目立つCTA禁止」と整合（実装手段＝onMouseハンドラは項1で要修正）。

---

## Haiku差し戻し指示

**コード（最優先）**
1. `page.tsx` と `archive/page.tsx` の `onMouseEnter/onMouseLeave` を撤去し、ホバー演出はCSS `:hover` に一本化（globals.cssに既存ルールあり）。どうしてもJSが要る箇所のみ `'use client'` の小Componentに切り出す。**これを直さないとビルドが通らない。**
2. `archive/page.tsx` を「date（または sequence）のみの最小リスト」に書き換え。number / fragment / color の表示を削除。
3. archiveの「no signals」分岐を削除し、空時は `null` を返す。
4. archiveの「← back」を文字 `◂` に置換（「back」の語を消す）。
5. number の `fontWeight: "bold"` を `300`〜`400` に。fragment の `fontStyle: "italic"` を `normal` に（page.tsx・archive両方）。
6. `globals.css` の `overflow:hidden` がarchiveのスクロールを潰さないよう、archive側で `overflow:auto`（または `body` のhiddenをトップページ限定）に調整。

**コンテンツ（seeds.json）**
7. **Day 0019 の "she" を除去。** 人称代名詞のない計器トーンへ書き換え。例の方向性（採用は任意、語数7〜12維持・途中終止）:
   `another hallway behind the one that was supposed to`
   （"she thought" を排し主体を消す。textureはarchitecture維持、隣接0018=counting/0020=absenceと非衝突なので問題なし。）
8. （任意・将来分）30日の texture 配列が完全周期にならないようシャッフルし、語数に揺らぎを持たせる。今回の30日は文字規則を満たすため必須ではない。

以上。最優先は **コード項1（ビルド破壊）** と **コンテンツ項7（"she" 人称違反）**、次いで **archive簡素化（項2・3・4）**。

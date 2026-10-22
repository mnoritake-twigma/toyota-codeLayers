# Figma への DS 展開プロンプト（Codex / Claude Code ＋ Figma MCP）

> 使い方
> 1. **前提**：Codex が CODEX_PROMPT_DS.md の DS-1〜DS-4 を終えていること
>    （`src/ds/tokens/tokens.json`、`src/ds/components`、`/ds` カタログ、`src/ds/DESIGN_SYSTEM.md` がある）。
> 2. エージェント（Codex か Claude Code）に Figma のリモート MCP サーバーを接続し、
>    Figma の公式スキル（figma-use / figma-generate-library / figma-code-connect）を入れておく。
> 3. Figma で空の Design ファイル「LUMIÈRE DS」をチームのプロジェクトに作り、URL を控える。
> 4. 下の「プロンプト本文」の `<FIGMA_FILE_URL>` を置き換えて貼る。
> 5. 終わったら「手作業で残ること」を自分で行う。

---

## プロンプト本文

```
このリポジトリの LUMIÈRE デザインシステム（DS）を、Figma のライブラリとして写してください。
対象ファイル：<FIGMA_FILE_URL>

まず次を読んでください。
- ルートの AGENTS.md。構築時の参考仕様は docs/PROJECT_CONTEXT.md §9
- src/ds/DESIGN_SYSTEM.md
- src/ds/tokens/tokens.json
- src/ds/components と src/app/ds-catalog
use_figma を使う前に必ず figma-use スキルを、ライブラリを作るときは
figma-generate-library スキルを読み込んでください。

## 原則
- **正はコード。Figma は写し。** tokens.json と部品のコードが基準。Figma 側で値を決めない。
  コードと食い違う点や、Figma で表現できない点を見つけたら、Figma を勝手に合わせず報告する。
- 作る前に search_design_system で、ファイルに既に同名の変数・スタイル・部品がないか確認し、
  あれば作り直さず更新する（二重に作らない）。
- 値はすべて変数かスタイルに結びつける。塗り・線・余白・角丸・文字に直値を残さない。
- 名前はコードと揃える。トークンは tokens.json のパスを「/」区切りにした名前、
  部品はコードの部品名、部品のプロパティ名とバリアント名はコードの props と同じにする。

## 進め方（フェーズごとに結果を短く報告してから次へ）

Phase F-1: Variables とスタイル
- コレクション「Primitive」：tokens.json の primitive（色・余白・角丸・寸法）。モードなし。
- コレクション「Semantic」：semantic トークン。値は Primitive への参照（エイリアス）にする。
  直値を入れない。
- 各変数のスコープを用途に合わせて絞る（文字色は Text fill、面は Frame/Shape fill、
  罫線は Stroke、余白は Gap と Padding、角丸は Corner radius）。
- 各変数の説明欄に、対応する CSS 変数名（例: --color-text-primary）を書く。
  Code syntax（Web）にも同じ CSS 変数名を設定する。
- 文字スタイル：tokens.json の文字の段階（page-title / section-title / sub-title / body /
  body-sm / caption / tag）ごとに作り、サイズと行の高さを合わせる。
  フォントはコードと同じNoto Sans JPを使う（通常Regular / 400、ステップ番号Bold / 700）。
  フォント名の変数にはCSSのfallbackリストではなく「Noto Sans JP」を設定する。
  ヒラギノなど端末依存のフォントは使わない。

Phase F-2: コンポーネント（ステップ3で磨く範囲だけ）
次の部品を作る。すべて Auto layout、変数バインド、コードと同じプロパティ名・バリアント名。
- Tag（variant: bright / weak / dark、size: sm / lg）
- Button（variant: primary / secondary、state: default / disabled / loading）
- TextButton（icon: arrow-right / chevron-left）
- SectionHeading（required: true / false）
- Stepper（current: 1〜5）と、その中の StepItem（state: complete / current / upcoming）
- DescriptionList の行（label と value のテキストプロパティ）
- DealerCard（閉じた状態の店舗項目。open: false / true の切り替え、店舗名・住所・定休日・
  営業時間はテキストプロパティ。サムネイルはグレーの枠で、画像はインスタンス側で差し替えられるようにする）
- VehicleTable の見出し行と車両行（state: default / selected）。試乗車のみで、種別タグは不要。
  列はグレード／ボディカラー／インテリアカラー。グレード欄にラジオを置く。
各部品の説明欄に、コードのパス（例: src/ds/components/Tag.tsx）と、
DESIGN_SYSTEM.md の該当箇所の要約を1〜2行で書く。
カタログ（/ds）にある他の部品（TextField、Select、Tabs、Notice、Accordion、Band など）は
今回は作らない。必要になったら後で足す。

Phase F-3: ページ構成
ファイルのページを次の順にする。
- Cover：ライブラリ名「LUMIÈRE DS」、「デモ用の架空ブランドです」、正はリポジトリの
  src/ds であること、最終同期日。
- Foundations：色見本（Semantic を用途別に）、文字スタイルの見本、余白と角丸の段階。
- Components：上の部品を部品ごとのセクションに並べ、全バリアントを並べる。
- Patterns：DealerCard を閉じた状態と開いた状態（VehicleTable つき）で組んだ見本1つ。
  これはステップ3でデザイナーが差し替えに使う手本になる。

Phase F-4: 検証
- use_figma で、全部品と Foundations の中に、変数かスタイルに結びついていない
  塗り・線・余白・角丸・文字が残っていないか調べ、残っていたら直す。件数を報告。
- get_screenshot で各部品を撮り、ローカルで npm run dev した /ds カタログの同じ部品と
  見比べ、色・寸法・文字の段階のずれを一覧にする（ずれがあれば Figma 側を直す。
  コード側の問題に見える場合は直さず報告）。

Phase F-5: Code Connect（Organization / Enterprise プランのときだけ）
- figma-code-connect スキルを読み込み、F-2 の部品と src/ds/components の部品を対応付ける。
  対応付けのファイルはリポジトリに src/ds/components/*.figma.tsx として置き、
  プロパティの対応（state → selectedId など）も書く。
- 公開（npx figma connect publish）はトークンが要るので実行しない。手順を README の
  「Figma との同期」節に書く。

## やらないこと
- tokens.json や部品のコードを Figma に合わせて書き換えること
- ライブラリの公開（Plugin API ではできないため、人が行う）
- 実在ブランドのロゴ・写真・フォントの使用

## 完了報告に含めること
- 作った変数の数（コレクション別）、文字スタイルの数、部品と各バリアント数
- 結びついていない値の件数（直す前と後）
- /ds カタログとのずれの一覧と、直したもの・直していないもの
- コードとの食い違いや、Figma で表現できなかった点
- 私が手でやる必要がある作業
```

---

## 手作業で残ること（エージェントの作業が終わった後）

1. **ライブラリを公開する**：Figma の Assets パネルからライブラリとして公開し、
   セッションで使うファイルでこのライブラリを有効にする。
2. **ガイドラインを付ける**（オープンベータ）：公開したライブラリに、`src/ds/DESIGN_SYSTEM.md` の
   「原則」「パターン」「禁止事項」を分けて3つ程度のガイドラインファイルとして追加する。
   エージェントに「このライブラリのガイドラインファイルの下書きを作って」と頼んで、
   DESIGN_SYSTEM.md と見比べて直す方法でもよい。
3. **スキル `/lumiere-ds` を作る**：Figma エージェントに DESIGN_SYSTEM.md を渡し、
   「この内容でコードレイヤーを作るときのスキルを作って」と頼む。ステップ2で二案を作るときに当てる。
4. **Code Connect を公開する**（プランが対応している場合）：README の手順で
   `npx figma connect publish` を実行する。
5. **リハーサルで確かめる**：採用案のコードレイヤーから店舗カードを Extract designs で抽出し、
   出てきたレイヤーがライブラリの部品や変数につながるかを確認する。つながらない場合は、
   ステップ3を「抽出した要素を Patterns の DealerCard や Tag に差し替えてから戻す」手順にする。

## 同期のルール（今後）

- 値や部品を変えるときは、**必ずコード（tokens.json / src/ds）を先に直し**、
  このプロンプトの該当フェーズだけをエージェントに再実行させる。
- Figma で先に試した変更は、DESIGN_SYSTEM.md に提案として書き、コードへ入れてから写し直す。

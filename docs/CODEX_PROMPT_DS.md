# Codex への依頼プロンプト：LUMIÈRE デザインシステム

> 使い方
> 1. アプリ作成中の Codex を、今のフェーズのコミットが終わったところで止める。
> 2. 更新した AGENTS.md（§6 と §9 を追加）をコミットする。
> 3. 下の「プロンプト本文」を Codex に貼る。DS ができて既存画面の置き換えが終わったら、
>    CODEX_PROMPT.md の残りのフェーズを再開させる（再開時に「AGENTS.md §9 に従って」と一言添える）。

---

## プロンプト本文

```
アプリの実装を一旦止めて、LUMIÈRE デザインシステム（DS）を作り、ここまでに作った画面を
DS に乗せ替えてください。以降のフェーズはすべて DS に従って実装します。

まずルートの AGENTS.md を読み直してください。§6（構成）と §9（DS のルール）を追加しました。
AGENTS.md とこのプロンプトが食い違ったら AGENTS.md を優先し、最後に報告してください。

## DS の方向性

参考サイト（lexus.jp の試乗予約・販売店選択画面）の見た目の規則を、下の計測値のとおり
再現してください。モノクロ基調、罫線と面の濃淡で区切る、角丸はごく小さい、影なし。
ただし、これは実在ブランドのサイトに見せかけるためのものではありません。
ブランド名は LUMIÈRE、ロゴはテキストのみ、写真やロゴ画像・独自フォントは使わず、
フッターに「デモ用の架空サイトです」と常に表示してください。

### 計測値（2026-10-22 時点、PC 幅 1024px で計測）

色（primitive）
- 黒 #000000（本文・見出し・主ボタン・現在ステップ・タブ下線）
- 文字の濃いグレー #343434（ページタイトル）
- グレー900 #434343（「必須」タグの面、車両テーブルの面）
- グレー500 #8B8B8B（住所・定休日などのラベル文字）
- グレー300 #CACACA（未到達ステップの丸、無効ボタンの面、
  未選択の select の文字）
- グレー200 #E5E5E5（区切り罫線）
- グレー50 #F7F7F7（ステップ表示の面、検索結果エリアの背景）
- 白 #FFFFFF
- エラー #A71619（エラー文言とエラーマークのみ）
アクセント色は無い。黒が主役。成功・注意・情報の状態色が必要なら、この灰色の段階と
エラー色だけで表現し、新しい色を増やすときは DESIGN_SYSTEM.md に理由を書く。

文字
- フォントはNoto Sans JPでコードとFigmaを統一する。通常400、ステップ番号700。
  public npmの @fontsource/noto-sans-jp から同梱し、外部フォントサービスや端末のローカルフォントに依存しない。
  参考サイトの独自フォントは使わない。
- 段階（size / line-height）：
  page-title 28/40、section-title 21/31.5、sub-title 20/30、body 16/28、
  body-sm 14/24、caption 12/20、tag 11/11
- 太さは 400 が基本。強調は太さより大きさと色で。

余白・寸法
- 本文の最大幅 768px、中央寄せ。
- セクション見出しの上に 幅30px・高さ3px の黒い短線、その下 35px に見出し。
  見出しの左に「必須」タグ（濃いグレーの面・白文字・11px・角丸2px・padding 5px 6px）。
- 罫線 1px #E5E5E5 で行を上下に区切る（選択中のモデル行など、padding 8px 16px）。
- 結果エリアは画面幅いっぱいの #F7F7F7 の帯（上下 48px）に、白い 768px のリストを置く。
  リストの各項目は padding 24px 32px、項目同士は 1px の罫線。

部品の形
- Stepper：#F7F7F7 の面・角丸 56px（ピル形）・padding 8px 24px。各ステップは直径32pxの丸
  （18px・太字の番号）＋14px のラベル。現在＝黒丸・白数字、完了＝黒丸にチェック、
  未到達＝#CACACA の丸・白数字。
- Tabs：右寄せのテキストタブ（14px）。選択中は下に 高さ5px の黒線。タブ列の下に 1px の罫線。
- Select / TextField：枠なし・下線のみ（1px）・高さ 45px・16px。未選択の文字は #CACACA。
  右端に ▼。
- Button primary：黒の面・白文字・14px・高さ 48px・角丸 3px・最小幅 100px。
  無効時は #CACACA の面・白文字。
- TextButton：黒文字＋右向き矢印（「変更する →」）、または左に「›」（「販売店詳細」）。
- Tag：bright（白の面・黒文字）、weak（透明・#CACACA の枠と文字）、dark（#434343 の面・白文字）。
  大きさは sm（11px、padding 5px 6px）と lg（14px、padding 7〜8px）。角丸 2px。
- Accordion：右端の「＋／−」で開閉。開くと項目の下に濃いグレーの面のテーブルが出る
  （見出し行は黒の面・白文字 12px、行は padding 16px 32px、白文字）。
- 店舗項目（DealerCard の形）：店舗名 16px、その下に左にサムネイル枠（131×80。AI 生成の
  店舗画像、読めないときはプレースホルダ）、右にラベル（12px・#8B8B8B）と値（14px）の定義リスト
  （住所・定休日・営業時間）。下に TextButton「› 販売店詳細」。

参考サイトに無い状態（読み込み中・0件・エラー・フォーカス）は、上の色と形だけで作る。
フォーカスリングは黒 2px＋白 2px の二重線にしてどの背景でも見えるようにする。
決めた値と、参考サイトの計測値から変えた点は DESIGN_SYSTEM.md に書くこと。

## 進め方（この順で、各フェーズの終わりにコミット）

Phase DS-1: トークン
- src/ds/tokens/tokens.json を W3C Design Tokens 形式で作る。2層構造にする：
  - primitive（例: color.neutral.900, space.4）
  - semantic（例: color.text.primary, color.surface.default, color.border.subtle,
    color.action.primary.bg, color.status.error.fg, space.stack.md, radius.control）
  アプリと部品は semantic だけを参照する。
- scripts/build-tokens.ts で tokens.json → src/ds/tokens/tokens.css（CSS 変数）と
  Tailwind テーマを生成。npm run tokens で実行。生成物はコミットする。
- Tailwind のバージョンを確認し（v3 なら tailwind.config の theme を、v4 なら CSS の @theme を）
  既定パレットを DS のトークンで「上書き」する。extend にしない。既定の色クラスが
  使えなくなることを確認する。

Phase DS-2: 部品
- src/ds/components に以下を作る。各部品はバリアントを props の列挙値で受け、色や寸法を
  props で受けない。forwardRef、aria 属性、キーボード操作に対応。
  - Button（primary / secondary、loading、disabled）、TextButton（arrow-right / chevron-left）
  - TextField、Textarea、Select（下線型、label、hint、error、required 表示つき）
  - Tabs（「都道府県から検索」「郵便番号から検索」に使う、右寄せ・下線型）
  - SectionHeading（短線＋見出し＋任意の「必須」タグ）
  - RadioCard（モデル選択に使う、選択状態つき）
  - Accordion と DataTable（店舗の開閉と、開いた中の車両テーブル）
  - DescriptionList（ラベル＋値。店舗の住所・定休日・営業時間）
  - Tag（bright / weak / dark、sm / lg）。Badge は作らず Tag に寄せる
  - Notice（info / error、本文と任意のアクション）
  - Stepper（進行状況 n/5、完了・現在・未到達、ピル形）
  - Band（画面幅いっぱいのグレーの帯。結果エリアに使う）
  - DateTimeField（日付＋時間帯の選択。第1・第2希望に使う）
  - Spinner と Skeleton、EmptyState
  - Header（テキストロゴ LUMIÈRE）、PageLayout（最大幅と余白）
- src/ds/index.ts からすべて export。
- /ds ルートに DS カタログ（src/app/ds-catalog）を作り、トークン一覧（色見本・余白・文字）と
  全部品×全バリアント×全状態を1ページに並べる。Figma でこのページをコードレイヤーとして
  開き、Extract designs で Figma ライブラリの下地にする想定。

Phase DS-3: 既存画面の乗せ替え
- ここまでに作ったページとドメイン部品（DealerCard, VehicleTable, ModelCard, StepIndicator など）を
  DS の部品とトークンだけで組み直す。StepIndicator は DS の Stepper に置き換える。
- 現行フローの不便さ（乗りたい車種・グレードがどの店舗にあるか、店舗を開くまで分からない）を残す。
- VehicleTable は試乗車のみ。列はグレード／ボディカラー／インテリアカラー、行は state: default / selected。種別タグは使わず、グレード欄のラジオで1台を選ぶ。
- 置き換え前後で npm run build と既存テストが通ること。

Phase DS-4: 守らせる仕組みとドキュメント
- scripts/check-ds.ts と npm run lint:ds：src/ 配下（src/ds/tokens を除く）で次を検出したら失敗。
  - Tailwind の任意値クラス（[...] を含むクラス）
  - 色コード（#xxx, rgb(, hsl(）と、style 属性での色・寸法の指定
  - src/ds 以外での .css ファイルの追加
  npm run lint からも呼ぶ。
- src/ds/DESIGN_SYSTEM.md を書く。Figma のエージェントや他の AI ツールが読んで、
  この DS で画面を作れることが目的。次の順で：
  1. 原則（3〜5行）
  2. トークン：semantic トークンの一覧と使い分け（いつ text.secondary か、など）
  3. 部品：各部品の用途、props、使ってよい場面・いけない場面、コード例1つ
  4. パターン：フォーム、選択リスト、空状態、読み込み中、エラーの組み方
  5. 禁止事項：§9 のルールを具体例つきで
  6. 新しい見た目が必要になったときの手順
  2000語以内。

## 制約
- 依存の追加は public npm のみ、最小限。UI ライブラリ・CSS-in-JS は入れない。
- 見た目の規則（色の段階・寸法・部品の形）は参考サイトに合わせるが、ロゴ・写真・独自フォント・
  ブランド名・文言のコピーは使わない。実在ブランドのサイトと誤認される作りにしない。

## 完了報告に含めること
- 決めたトークンの主要な値（色・文字サイズ・余白の段階）
- 部品の一覧
- 乗せ替えで見た目以外に変わってしまった箇所（あれば）
- npm run build / lint / lint:ds / test の結果
- 判断に迷って仮置きしたこと
```

---

## 補足：Figma 側への展開（コードの DS ができた後）

コードの DS を正にして、Figma 側は同じ内容を写す形にします。

1. **ライブラリ**：Claude Code に Figma MCP の `figma-generate-library` スキルで
   `tokens.json` から Variables を、`/ds` カタログから部品を作らせ、ライブラリとして公開する。
   （代わりに `/ds` をコードレイヤーで開いて Extract designs で下地を取る手もある）
2. **ガイドライン**：公開したライブラリに `DESIGN_SYSTEM.md` の「原則」「パターン」「禁止事項」を
   ガイドラインファイルとして付ける（オープンベータ）。ライブラリを使う生成時にエージェントへ自動で渡る。
3. **スキル**：Figma エージェントに `DESIGN_SYSTEM.md` を読ませて `/lumiere-ds` スキルを作らせる。
   ステップ2で二案を作るとき `/lumiere-ds` を当てる。
4. **Code Connect**：ライブラリの部品と `src/ds/components` を対応付けておくと、エンジニアが
   MCP でデザインを読んだときに DS の部品名で返ってくる。コードレイヤー生成時に参照されるかは
   未確認なので、セッションでは「コード→Figma の読み取りで効く」とだけ言う。

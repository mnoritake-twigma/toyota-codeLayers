# LUMIÈRE DS

コードを正本とする、架空ブランドのデモ用デザインシステムです。
白黒と罫線で階層を作り、実在ブランドの写真・影・外部フォントを使いません。§8に適合するAI生成の架空画像は使えます。
色、寸法、文字は semantic トークンを参照します。
希望日時は予約確定を意味しません。

## トークン

`tokens/tokens.json` がW3C Design Tokens形式の正本です。primitiveは計測値、semanticは用途です。
`npm run tokens` でCSS変数とTailwind v4テーマを生成します。生成物は編集しません。
text-primaryは本文、text-titleはページタイトル、text-secondaryは補足と定義リストのラベル、text-placeholderは未選択状態、text-inverseは濃い面の文字です。
surface-defaultは白、surface-subtleは検索結果帯、surface-darkは車両一覧です。
border-subtleは区切り、border-strongは入力・選択の強調です。
action-primary-bg/fgは主操作、action-disabled-bgは無効操作、status-error-fgはエラーのみ、focus-ring/gapはフォーカス用です。
spaceはnone、hairline、micro、tiny、tag-y、tag-x、xs、sm、md、lg、xl、heading-gap、section、pageの順で0/1/2/4/5/6/8/12/16/24/32/35/48/64です。
radiusはnone=0、tag=2、control=3、pill=56。sizeはcontent=768、control=45、button=48、button-min=100、step=32、rule-width=30、rule-height=3、tab-line=5、thumbnail-width=131、thumbnail-height=80です。
fontSize/lineHeightはpage-title 28/40、section-title 21/31.5、sub-title20/30、body16/28、body-sm14/24、caption12/20、tag11/11、step18/32。fontFamily-bodyはシステム日本語フォントです。単位はpx。

## 部品

全コンポーネントは `src/ds` からimportします。操作部品はネイティブ要素を使い、ref・ariaをサポートします。HTMLのstyle/colorや寸法propsを渡さず、用途のvariantを選びます。

| 部品            | propsと用途・避ける用途                                                                              | 例                                                                              |
| --------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Button          | variant primary/secondary、size md/lg、loading、disabled。フォーム送信・遷移。リンクの装飾に使わない | `<Button loading={busy}>申し込む</Button>`                                      |
| TextButton      | variant arrow-right/chevron-left。補助操作。主送信に使わない                                         | `<TextButton>変更する</TextButton>`                                             |
| TextField       | label、hint、error、required、標準input属性。単行入力。長文不可                                      | `<TextField label="氏名" required />`                                           |
| Textarea        | 同上。備考など長文。単行項目に使わない                                                               | `<Textarea label="備考" />`                                                     |
| Select          | 同上。単一選択。自由入力不可                                                                         | `<Select label="県"><option>東京都</option></Select>`                           |
| Tabs            | items、value、onChange、panelId。検索方法の切替。ページ遷移に使わない。矢印/Home/End対応             | `<Tabs label="検索" items={items} value={tab} onChange={setTab}/>`              |
| SectionHeading  | required、children。短線付きセクション。小見出しには使わない                                         | `<SectionHeading required>販売店</SectionHeading>`                              |
| RadioCard       | name、value、selected、onSelect、disabled、variant(default/model)。modelは画像を上段、情報を下段に置くカード。単一モデル選択。複数選択不可                              | `<RadioCard name="model" value="A" selected onSelect={select}>A</RadioCard>`    |
| Accordion       | title、summary、defaultOpen。登録車両を隠す。summary内に操作部品を入れない                           | `<Accordion title="販売店">内容</Accordion>`                                    |
| DataTable       | caption、columns、rows(key/cells)。車両の比較。レイアウト目的不可                                    | `<DataTable caption="車両" columns={columns} rows={rows}/>`                     |
| DescriptionList | items(label/value)。住所・確認内容。操作一覧には使わない                                             | `<DescriptionList items={items}/>`                                              |
| Tag             | variant bright/weak/dark、size sm/lg。分類・必須表示。ボタンにしない                                 | `<Tag variant="weak">展示車</Tag>`                                              |
| Notice          | variant info/error、action。補足・エラー。成功を予約確定と表現しない                                 | `<Notice>希望日時です</Notice>`                                                 |
| Stepper         | step 1〜5。進捗。操作ナビにはしない                                                                  | `<Stepper step={2}/>`                                                           |
| Band            | children。検索結果の全幅帯。多重に入れない                                                           | `<Band>検索結果</Band>`                                                         |
| DateTimeField   | id、label、value、onChange、required、disabled、error。希望日時。空き枠の表示には使わない            | `<DateTimeField id="first" label="第1希望" value={value} onChange={setValue}/>` |
| Spinner         | 読込状態。長い説明は隣に添える                                                                       | `<Spinner/>`                                                                    |
| Skeleton        | 読込中の仮の面。実データとして使わない                                                               | `<Skeleton/>`                                                                   |
| EmptyState      | title、children。0件。APIエラーはNoticeへ                                                            | `<EmptyState title="0件">条件を変更してください</EmptyState>`                   |
| Header          | テキストロゴ。画像ロゴへの置換不可                                                                   | `<Header/>`                                                                     |
| PageLayout      | ページのmain領域。入れ子のmainを作らない                                                             | `<PageLayout>本文</PageLayout>`                                                 |
| Placeholder     | variant dealer/model、label。画像なしの枠。実写画像は使わない                                        | `<Placeholder label="販売店"/>`                                                 |

AssetImageは `src`（リポジトリ内画像）、`alt`、`variant`（dealer/model）を受けます。例：`<AssetImage src={image} alt="架空の店舗" />`。
寸法はPlaceholderと共通。dealerは131×80でcover、modelは幅100%・縦横比3:2（semantic aspectRatio.model）でcontain（車体を切らない）です。
src未設定・ロード失敗なら同じ枠へ戻り、src変更時は再試行します。実在モデルに見える疑義画像と外部URLは渡しません。

## パターン

フォームはSectionHeading → TextField/Select → Notice(error) → Button。labelを必ず付けます。
選択リストはRadioCard、販売店はBand内のAccordionとDataTable。展示車の選択は禁止します。
0件はEmptyState、通信中はSpinnerとSkeleton、失敗はNotice(error)と再試行操作を組み合わせます。
`ds-stack` は縦間隔、`ds-grid` はフォーム列、`ds-row` は折返し付き横並び、`ds-actions` は末尾操作です。

## 禁止事項

`bg-blue-500`など既定色、`p-[13px]`など任意値、`style={{color:...}}`は禁止。
DS外のCSS、色コード直書き、primitive参照、影による階層、実在ブランドの写真、外部フォントは禁止。
生成CSSは編集せず、DS外に新しい見た目を定義しません。

## 追加手順

用途を確認し既存variantを再利用。足りなければsemanticトークンを正本へ追加し `npm run tokens`。
DS部品の列挙variantへ実装し、この文書と `/ds` の全適用状態を更新。lint/build/testを通してコミット。
計測値との差：狭い画面ではStepperラベルを丸の下へ、店舗情報を縦へ並べます。車両表は横スクロールを許容します。
Tag lgの余白は8pxを採用。日時の候補はデモ営業時間の10:00〜18:00を30分刻みで表示し、空き状況とは無関係です。
読み込みのSpinnerは現在文字色、SkeletonとNoticeは薄いグレー。フォーカスのみ黒2px＋白2pxの線を使います。

カタログ用の `ds-preview-hover` / `ds-preview-focus` は静的な状態見本です。アプリで常時使わず、実操作の疑似クラスに任せます。フォームのホバーは下線を黒にします。全公開部品はforwardRefに対応します。

モデル選択は ds-model-grid（PC2列・モバイル1列）に RadioCard variant="model" を並べ、画像の下を ds-model-details で包みます。従来の高さ80のモデル画像は車体が小さすぎたため、3:2の画像領域に変更。店舗画像の131×80は維持します。

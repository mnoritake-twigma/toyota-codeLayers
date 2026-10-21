# LUMIÈRE DS

コードを正本とする、架空ブランドのデモ用デザインシステムです。
白黒と罫線で階層を作り、写真・影・外部フォントを使いません。
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

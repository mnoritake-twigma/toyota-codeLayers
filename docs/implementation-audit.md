# 最新仕様との照合（2026-10-22）

最新版AGENTS.mdを全文再読。§2「1台を選ぶ」、§3「登録車両の詳細」、§8「条件付きAI画像」の仕様側の食い違いは解消済み。
指定の docs/prompts/CODEX_PROMPT_DS.md はローカルに存在せず、AI店舗画像の指定が更新されていた docs/CODEX_PROMPT_DS.md の「プロンプト本文」を適用。

|項目|作業開始時の状態|規模|対象ファイル|結果|
|---|---|---|---|---|
|§2 店舗アコーディオン、展開後だけ車両情報|実装済み|不要|src/components/DealerCard.tsx|維持・再検証|
|§2 試乗車1台の選択、展示車は選択不可|実装済み|不要|src/components/VehicleTable.tsx、src/features/booking/BookingContext.tsx|維持・再検証|
|§2 未登録店舗を電話案内へ集約|実装済み|不要|src/app/pages/DealerSelect.tsx、src/features/dealers/sortDealers.ts|維持・再検証|
|§4 dealer_vehiclesとRLS、車両を指定する申し込み|実装済み|不要|supabase/migrations/202610220003_dealer_vehicles.sql、supabase/functions/、src/api/、src/types.ts|維持・再検証|
|§4 東京30件前後、未登録・展示のみ各1〜2割|東京31、各5店舗。全国157|不要|scripts/export-seed.ts、supabase/seed.sql、src/data/seed/|維持・再検証|
|§4 定休日|実装済み|不要|src/types.ts、店舗シード、DealerCard|維持|
|§5 環境変数→公開設定→シード|実装済み。接続値は未提供|小（設定のみ）|src/config.public.ts|実接続は未設定|
|§6 DS・ページ・ドメイン部品の分離、APIコメント|実装済み|不要|src/ds/、src/components/、src/api/|維持|
|§6 Code Connect|Figmaライブラリ作成後の工程|後続|src/ds/*.figma.tsx|未実施（Figma接続先未指定）|
|§9 W3Cトークン・生成・既定テーマ除去|実装済み|不要|src/ds/tokens/、scripts/build-tokens.ts|DS-1で再検証|
|§9 部品・カタログ・フォーカス・状態表示|実装済み、画像部品だけ不足|中|src/ds/components/AssetImage.tsx、src/ds/styles.css、src/app/ds-catalog/|DS-2で補完予定|
|§9 lint・CI|実装済み、画像サイズ監視なし|小|scripts/check-assets.ts、package.json|DS-4で追加予定|
|§8 AI画像|前回の写真不使用指定で削除済み。旧画像13枚は全て200KB超|中|src/assets/、src/components/ModelCard.tsx、DealerCard.tsx|DS-3で圧縮・再採用予定|
|§8 画像失敗時の同寸法枠|画像なしの固定枠のみ|小|src/ds/components/AssetImage.tsx|DS-2で実装予定|
|§8 画像一覧とAI生成表記|未作成|小|src/assets/README.md|DS-3で追加予定|
|README・DS文書の画像禁止／旧仕様矛盾の説明|最新版と不一致|小|README.md、src/ds/DESIGN_SYSTEM.md|DS-4で更新予定|

## DS-1

既存のW3C primitive/semanticトークン、生成CSS、Tailwind v4の全既定テーマのリセットを保持。
新しい色・寸法は不要。画像は現在のdealer 131×80、model幅100%×高さ80の枠に収める。

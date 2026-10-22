# 最新仕様との照合（2026-10-22）

最新版AGENTS.mdを全文再読。§2「1台を選ぶ」、§3「登録車両の詳細」、§8「条件付きAI画像」の仕様側の食い違いは解消済み。
指定の docs/prompts/CODEX_PROMPT_DS.md はローカルに存在せず、AI店舗画像の指定が更新されていた docs/CODEX_PROMPT_DS.md の「プロンプト本文」を適用。

| 項目                                            | 作業開始時の状態                                        | 規模           | 対象ファイル                                                                                      | 結果                                                  |
| ----------------------------------------------- | ------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| §2 店舗アコーディオン、展開後だけ車両情報       | 実装済み                                                | 不要           | src/components/DealerCard.tsx                                                                     | 維持・再検証                                          |
| §2 試乗車1台の選択（グレード・色）            | 実装済み                                                | 不要           | src/components/VehicleTable.tsx、src/features/booking/BookingContext.tsx                          | 維持・再検証                                          |
| §2 未登録店舗を電話案内へ集約                   | 実装済み                                                | 不要           | src/app/pages/DealerSelect.tsx、src/features/dealers/sortDealers.ts                               | 維持・再検証                                          |
| §4 dealer_vehiclesとRLS、車両を指定する申し込み | 実装済み                                                | 不要           | supabase/migrations/202610220003_dealer_vehicles.sql、supabase/functions/、src/api/、src/types.ts | 維持・再検証                                          |
| §4 東京30件前後、未登録・展示のみ各1〜2割       | 東京31、各5店舗。全国157                                | 不要           | scripts/export-seed.ts、supabase/seed.sql、src/data/seed/                                         | 維持・再検証                                          |
| §4 定休日                                       | 実装済み                                                | 不要           | src/types.ts、店舗シード、DealerCard                                                              | 維持                                                  |
| §5 環境変数→公開設定→シード                     | 実装済み。接続値は未提供                                | 小（設定のみ） | src/config.public.ts                                                                              | 実接続は未設定                                        |
| §6 DS・ページ・ドメイン部品の分離、APIコメント  | 実装済み                                                | 不要           | src/ds/、src/components/、src/api/                                                                | 維持                                                  |
| §6 Code Connect                                 | Figmaライブラリ作成後の工程                             | 後続           | src/ds/*.figma.tsx                                                                                | 未実施（Figma接続先未指定）                           |
| §9 W3Cトークン・生成・既定テーマ除去            | 実装済み                                                | 不要           | src/ds/tokens/、scripts/build-tokens.ts                                                           | DS-1で再検証                                          |
| §9 部品・カタログ・フォーカス・状態表示         | 実装済み、画像部品だけ不足                              | 中             | src/ds/components/AssetImage.tsx、src/ds/styles.css、src/app/ds-catalog/                          | DS-2でAssetImageと状態カタログを追加済み              |
| §9 lint・CI                                     | 実装済み、画像サイズ監視なし                            | 小             | scripts/check-assets.ts、package.json                                                             | DS-4で容量・一覧・未採用画像の検査を追加済み          |
| §8 AI画像                                       | 前回の写真不使用指定で削除済み。旧画像13枚は全て200KB超 | 中             | src/assets/、src/components/ModelCard.tsx、DealerCard.tsx                                         | 全13枚200KB以下、8枚再採用・5枚は要確認として報告のみ |
| §8 画像失敗時の同寸法枠                         | 画像なしの固定枠のみ                                    | 小             | src/ds/components/AssetImage.tsx                                                                  | DS-2で同寸法フォールバックを実装済み                  |
| §8 画像一覧とAI生成表記                         | 未作成                                                  | 小             | src/assets/README.md                                                                              | DS-3で一覧・bytes・採否理由を記録済み                 |
| README・DS文書の画像禁止／旧仕様矛盾の説明      | 最新版と不一致                                          | 小             | README.md、src/ds/DESIGN_SYSTEM.md                                                                | DS-4で最新版に更新済み                                |

## DS-1

既存のW3C primitive/semanticトークン、生成CSS、Tailwind v4の全既定テーマのリセットを保持。
新しい色・寸法は不要。画像は現在のdealer 131×80、model幅100%×高さ80の枠に収める。

## DS-2〜4と未実施事項

DS-2：既存21部品＋Placeholderを維持し、forwardRef対応のAssetImageと通常・未設定・破損画像のdealer/model両variantをカタログに追加。
DS-3：車両7枚・店舗1枚を再組み込み。疑義のあるm02/m04/m10/d02/d03は差し替えずreport対象。内容を変えず圧縮した確認用ファイルをsrc/assets/reviewに保持し、アプリにはimportしない。
既存のdealer_vehicles・東京31件・各5件の未登録/展示のみ・電話グループ・選択車両の保存/RLSは再検証済み。重複のDB変更は作らない。
DS-4：README/DS文書を更新し、lintから画像検査も実行。元の利用者によるAGENTS.md変更とプロンプト文書は書き換えない。

未実施：Supabase接続値の設定・実プロジェクトへの反映（値未提供）、Figmaライブラリ/Code Connect（後続工程）、疑義画像5枚の再生成・差し替え（今回の明示指示により実施しない）。
仕様解釈：プロンプトの一般的な「写真不使用」より、最新版AGENTS §8と同プロンプト内のAI店舗画像の具体条件を優先。画像方針の仕様矛盾は解消済みとして扱う。

## 最終検証

Node 20でbuild/lint/lint:ds/typecheck成功。Vitest 22件、Deno Edge Functionテスト3件成功。
トークン再生成の差分なし。ローカルPostgreSQL互換環境で全マイグレーション・シード二重投入・匿名読取/申込INSERT・店舗不一致/未指定拒否を確認。
ブラウザで通常画像の読込成功と、未設定/失敗時の同寸法枠（店舗131×80）を確認。
Supabaseの実プロジェクトへのデプロイ・実通信の確認は未実施。

## 2026-10-22 画像再生成の追加対応

上記監査後、ユーザーの追加指示で保留5枚（m02・m04・m10・d02・d03）を再生成しました。全13枚が採用状態となり、画像の未対応項目は解消しています。車両は側面・斜め後方、店舗2枚は車両なし。新画像は106,393〜170,390 bytes。プロンプトと採用記録は src/assets/ にあります。

2026-10-22 更新：展示車を扱う仕様を廃止。試乗車だけの3列テーブルとグレード分散シードへ移行。旧リモート環境への反映は別作業。

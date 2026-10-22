# LUMIÈRE — 試乗お申し込みデモ

Figma Code layers Enablement（60分）の現行フローを体験するためのフロントエンドです。**本番用途ではありません。実際の個人情報は入力しないでください。** ブランドは架空、ロゴはテキスト、車両・店舗画像はAI生成の架空イメージです。要確認画像と読み込み失敗時はプレースホルダを表示します。

## ローカル起動

Node **20.19以上の20系**（検証: 20.20.2）、public npmのみ。

```sh
nvm use
npm install
npm run dev
```

Vite既定の http://localhost:5173 で開きます。

```sh
npm run build
npm run lint
npm run typecheck
npm test
npm run seed:export
npm run tokens
npm run lint:ds
```

## LUMIÈRE デザインシステム

カタログは http://localhost:5173/ds 。全画面は `src/ds` の部品とsemanticトークンで構成します。
正本は `src/ds/tokens/tokens.json`（W3C Design Tokens、primitive/semanticの2層）。
`npm run tokens` がCSS変数・Tailwind v4 `@theme`・カタログ見本CSSを生成します。生成物はコミットします。
既定テーマは `--*: initial` でリセットします。DS外のCSS、任意値クラス、インラインstyle、色の直書きは `npm run lint:ds` で拒否します。
`npm run lint` とCIも同検査を実行し、CIでは生成差分も検査します。
使い方・各部品のprops・例・追加手順は [DESIGN_SYSTEM.md](src/ds/DESIGN_SYSTEM.md) を参照してください。
Figmaでは `/ds` をCode layerで開いてExtract designsを行います。Figmaライブラリ作成とCode Connectは後続作業です。

## フローと制約

1. モデル選択（10種）
2. 販売店選択（県／郵便番号から検索）
3. 情報入力（第1・第2希望日時を含む）
4. 確認
5. 完了（受付番号・販売店からの確認連絡）

県検索は店舗コード順、郵便番号検索は先頭3桁の代表座標から半径30km以内の店舗を直線距離順。試乗車登録の有無では並び替えません。店舗を開いて車両一覧を確認し、試乗車1台を選択します。展示車は選択不可、登録なしの店舗は末尾の「電話で問い合わせする」にまとめます。各グループ内は元の順序を維持します。

空き枠・仮押さえ・確定予約のAPIはありません。`vehicles` は店舗に登録された試乗車・展示車の詳細、`hasTestCar` はその中の試乗車登録有無です。日時は日本時間の希望として保存し、確定と表示しません。認証・管理画面・メール送信はありません。

状態はReact Contextで保持し、リロードでリセットされます。入力個人情報をブラウザーの永続ストレージに保存しません。検索中の条件変更や連続検索では古いリクエストを中断します。

## Supabaseの準備（手動）

1. Supabaseでデモ専用の新しい無料プロジェクトを作成してください。
2. Supabase CLIを公式手順でインストールし、ルートで実行します（CLI未導入なら各行の `supabase` を `npx supabase` に置き換え可能）。

```sh
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
# seed.sqlを反映。デモ用の新規DBで実行してください。
supabase db push --include-seed
supabase functions deploy search-dealers
supabase functions deploy submit-request
```

[公式のマイグレーション手順](https://supabase.com/docs/guides/deployment/database-migrations)に沿っています。`supabase/config.toml` はseedと関数設定を含みます。認証なしのデモ関数としてJWTゲートウェイ検証を無効化し、関数内部からDBへは公開anon権限だけでアクセスします。両関数はOPTIONSとCORS `*` に対応しています。

3. `src/config.public.ts` に検証プロジェクトの次の2値を入れ、コミットします。

```ts
export const publicConfig = {
  supabaseUrl: "https://YOUR_PROJECT_REF.supabase.co",
  supabaseAnonKey: "YOUR_PUBLIC_ANON_KEY",
};
```

フロントには公開用publishable keyまたはlegacy anon keyを使用できます。設定名supabaseAnonKeyは互換性のため維持しています。publishable keyはapikeyヘッダーのみに送信します。管理用の秘密鍵は設定しません。関数内で使う `SUPABASE_URL` と `SUPABASE_ANON_KEY` はSupabase標準環境の値です。フロントは `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` があればそちらを優先します（`.env.example` を参照）。片方だけ上書きすると不一致になるため、URLとキーは対で設定してください。

4. デプロイ後、架空情報で最後まで送信し、受付番号が表示されることを確認してください。Dashboardで行を確認できます。anonから申し込み一覧を読めないことも確認してください。

### データとRLS

- `models` / `prefectures` / `dealers` / `dealer_vehicles`：anonにSELECTのみ。
- `test_drive_requests`：anonにINSERTのみ、SELECT権限・ポリシーなし。返信番号は関数で生成して `return=minimal` で保存し、読取権限を追加せず返します。
- 10モデル・47県・157店舗・2,425台。東京31、神奈川16、大阪16、愛知12店舗。
- 各モデルで登録なし・展示車のみがそれぞれ1〜2割。東京では各5店舗（5/31）です。既存の店舗を削除せず東京を7店舗追加しました。
- `scripts/export-seed.ts` が唯一の生成元で、SQL・フロント用JSON・関数用の郵便番号座標JSONを同時生成します。
- 店舗名・住所・電話・郵便番号はデモ用です。代表座標も簡略化した合成データです。実在の郵便住所や道路距離を検索するものではありません。
- 郵便番号例：`1000001` / `1500001`（東京代表）、`2200001`（横浜代表）、`5300001`（大阪代表）、`4500001`（名古屋代表）。未定義の `9990000` は0件です。
- SQLは主キーでupsertし再投入可能です。既存行の値を更新します。既存DBにも `db push` → `db push --include-seed` → 両関数のdeployを実行してください。新マイグレーションは旧登録テーブルを廃止します。過去の申し込みはvehicle_id=NULLを保持し、新規申し込みは試乗車IDを必須とします。DBの複合外部キーとRLSでも店舗・モデル・試乗車の一致を検証します。

Edge Functionの単体テストは `deno test --allow-env supabase/tests/functions_test.ts` で実行できます（モック通信、実デプロイ不要）。

## オフラインと画面状態

設定なし・ネットワークエラー・5xx・不正応答では検索を同梱JSONにフォールバックし、「オフラインデータで表示中」を表示します。4xxはAPIエラーを表示します。APIの正常な0件をシードで上書きしません。10秒で通信を打ち切ります。

**送信には稼働中のSupabaseが必要です。** 送信失敗時は入力を保持してエラー表示し、架空の受付成功やローカル保存へは切り替えません。未接続でもステップ4まで体験できます。通信切断時はサーバー側だけ保存された可能性があるため、画面に重複送信への案内を表示します。

接続済みの `/dealers?delay=3000` で検索すると、読み込み表示を約3秒維持します。Edge Functionの `?delay=ms` は0〜3000に制限しています。FigmaのExtract designsで読み込み中の状態を取得する際に使えます。

## Figma Code layersでクローンする際の確認事項

- ファイルを編集する担当者に **Fullシート** があること。
- 組織の管理者がGitリポジトリのクローンを許可していること。
- GitHubアカウントがこのリポジトリを読めること。
- Supabase URLが公開到達可能であり、VPN・IP許可リスト・社内ネットワークを必要としないこと。
- public npmのみで、レジストリへのログインが不要であること。
- `npm install` / `npm run build` / `npm run dev` が動くこと。リポジトリは3GB未満。
- `config.public.ts` に検証用のURLとanon keyを設定し、RLSを先に適用すること。
- ファイル閲覧者にコードレイヤーのソースが見えることを前提に、機密情報を置かないこと。
- 初回クローン時のFigmaによる設定ファイル追加は正常です。
- クローン先の環境変数設定可否は未確認のため、コミット済み公開設定で動く構造です。
- SPAを静的配信する場合、任意のルートを `index.html` にフォールバックさせてください。

実際のFigma上でのクローン・Fullシートと管理者設定・実Supabaseへの接続は、セッション前に担当者が確認してください。

## 構成

| 場所                                        | 役割                                                      |
| ------------------------------------------- | --------------------------------------------------------- |
| `src/app/`, `src/app/pages/`                | ルーティング、5画面                                       |
| `src/components/`                           | propsで描画する店舗カード・車両表・モデルカード・日時入力 |
| `src/features/booking/`                     | React Contextの申し込み状態                               |
| `src/features/dealers/`                     | 非同期検索フック、純粋な並び替え・フィルタ関数            |
| `src/api/`                                  | fetchクライアント、検索フォールバック、申し込み送信       |
| `src/data/seed/`                            | 同梱の検索・表示用データ                                  |
| `src/ds/`                                   | デザイントークン、Tailwind共通スタイル                    |
| `supabase/migrations/`, `supabase/seed.sql` | テーブル・RLS・デモデータ                                 |
| `supabase/functions/`                       | 検索、送信、共通入力検証                                  |
| `scripts/export-seed.ts`                    | SQLとJSONの再生成                                         |

## セッションで変更される想定の箇所

### 案A：近い順＋試乗車ありを先頭（未実装）

- `src/features/dealers/sortDealers.ts`：`sortDealers` の比較順を変更、`filterDealers` を必要に応じて変更。
- `src/features/dealers/useDealerSearch.ts`：並び替え方の指定が必要になった場合の接続点。
- `src/components/DealerCard.tsx` / `VehicleTable.tsx`：採用案の見た目をFigmaで磨いて差し替える箇所。
- `src/ds/tokens/tokens.json`：色・余白・角丸・文字サイズの調整。

県検索には距離がありません。「近い順」を県検索にも適用するなら、基準地点の入力とデータ仕様を検討する必要があります。現行APIが返す距離は郵便番号検索時だけです。

### 案B：日時を先に聞く（未実装）

- `src/components/PreferredDateTimeField.tsx`：独立した入力部品を移動・再利用。
- `src/app/pages/InfoInput.tsx`：元の入力箇所。
- `src/app/pages/DealerSelect.tsx` または新しい前段ページ：先に希望を聞く配置先。
- `src/app/App.tsx` / DSの `Stepper`：必要に応じてルートとステップ表示を変更。
- `src/features/booking/BookingContext.tsx`：希望日時を保持する状態。
- `src/api/submitRequest.ts` / `supabase/functions/submit-request/index.ts`：希望として保存する契約を確認。

日時を先に聞いても空き枠を照会するAPIはありません。「空き」「確定」と表示せず、希望として受けるか、販売店システム連携を待つかをセッション内で判断します。案A・案Bは現行コードには実装していません。

## 判断・未設定事項

最新版AGENTS.mdの§2・§3は車両1台の選択・登録車両詳細に統一済みで、仕様間の食い違いは解消済みです。DS導入時の「挙動を変えない」より、同依頼末尾の販売店・データ修正指定とAGENTSの詳細仕様を優先しました。接続値が未提供なので公開設定は空です。郵便番号代表座標・店舗情報・電話番号は合成データです。モデルと県の選択肢は同梱シードを使用し、店舗検索・送信のみEdge Functionへ接続します。

受付番号はUUID由来の `LM-` + 32桁です。Supabaseの実デプロイ・RLSの実DB確認・実通信での完了表示は接続後に必要です。自動テストは検索順、データ配分、フォールバック、送信契約、入力検証を対象としています。

## 郵便番号・都道府県検索と現在地デモの接続点

郵便番号検索は先頭3桁の代表点から半径30kmに限定します。都道府県検索は県内店舗のみ、コード順です。オンライン・オフラインとも同じ距離・範囲の純関数を使用します。30kmはデモ用の仮設定です。店舗座標は47都道府県それぞれの都市周辺に揃えた合成データです。

`1000001` と `1000002` は同じ100の代表点なので同じ結果です。東京 `1000001` と大阪 `5300001` を使うと地域の異なる結果を比較できます。7桁単位の正確な住所ジオコーディングは行っていません。

現在地からの初期表示をCode layersで作る場合は、`src/app/pages/DealerSelect.tsx` から `navigator.geolocation` で取得した緯度経度を検索へ渡す変更が必要です。共通の `nearbyDealers(rows, {lat, lng})` と `SEARCH_RADIUS_KM` を `supabase/functions/_shared/search.ts` に置き、フロントからは `src/features/dealers/sortDealers.ts` 経由で利用できます。API入力を座標に拡張する場合は `SearchInput`（`src/types.ts`）、`parseSearch`、検索APIとフォールバックの両方に座標経路を追加してください。位置情報の取得・座標APIの拡張自体は未実装です。

既にシードを投入したSupabaseは `supabase db push` で追加の座標補正マイグレーションを適用し、`supabase functions deploy search-dealers` で検索関数を更新してください。ローカルの同梱データには反映済みです。

## DS移行時の判断

最新版§8の条件に従い、全13枚とも200,000 bytes以下です。保留していた5枚は追加指示により再生成し、車両は側面・斜め後方の独自コンセプト形状、店舗は車を写さない外観・内装へ差し替えました。一覧と目視理由は [画像README](src/assets/README.md) を参照してください。ロゴはテキストのみ、外部フォントは読み込みません。画像の失敗時表示はDSのAssetImageが管理します。`npm run lint:assets`（lint・CIから実行）が画像容量と一覧・使用状況を検査します。
店舗詳細は外部リンク先がないため、同じ画面で電話番号・郵便番号・代表地点からの距離を展開します。
日時は日付と10:00〜18:00の30分刻みの選択欄です。この候補は空き状況ではなくデモ用の希望時間です。
`/ds` と車両シードは遅延ロードし、初回バンドルを分割しています。
検証用プロジェクトのURLと公開publishable keyを設定済みです。東京都の店舗検索APIがHTTP 200・31件を返すことを確認しました。申し込み保存の実接続確認は別途行ってください。

最新の差分と対応状況は [仕様照合一覧](docs/implementation-audit.md) を参照してください。ローカルにあるDSプロンプトは `docs/CODEX_PROMPT_DS.md` で、指定された `docs/prompts/` は存在しませんでした。

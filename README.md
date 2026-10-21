# LUMIÈRE — 試乗お申し込みデモ

Figma Code layers Enablement（60分）の現行フローを体験するためのフロントエンドです。**本番用途ではありません。実際の個人情報は入力しないでください。** ブランドは架空、ロゴはテキスト、車両・店舗画像はAI生成の架空イメージです。

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
```

`src/styles/tokens.css` のCSS変数を `tailwind.config.js` から参照します。Tailwind 4では `src/styles/index.css` の `@config` で設定を読み込みます。UIライブラリは使いません。

## フローと制約

1. モデル選択（10種）
2. 販売店選択（県／郵便番号から検索）
3. 情報入力（第1・第2希望日時を含む）
4. 確認
5. 完了（受付番号・販売店からの確認連絡）

県検索は店舗コード順、郵便番号検索は先頭3桁の代表座標から半径30km以内の店舗を直線距離順。試乗車登録の有無では並び替えません。未登録店舗も選択できます。電話案内は残しています。

空き枠・仮押さえ・確定予約のAPIはありません。`hasTestCar` は試乗車の**登録有無**だけです。日時は日本時間の希望として保存し、確定と表示しません。認証・管理画面・メール送信はありません。

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

使うのは公開用anon keyです。管理用の秘密鍵は設定しません。関数内で使う `SUPABASE_URL` と `SUPABASE_ANON_KEY` はSupabase標準環境の値です。フロントは `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` があればそちらを優先します（`.env.example` を参照）。片方だけ上書きすると不一致になるため、URLとキーは対で設定してください。

4. デプロイ後、架空情報で最後まで送信し、受付番号が表示されることを確認してください。Dashboardで行を確認できます。anonから申し込み一覧を読めないことも確認してください。

### データとRLS

- `models` / `prefectures` / `dealers` / `dealer_test_cars`：anonにSELECTのみ。
- `test_drive_requests`：anonにINSERTのみ、SELECT権限・ポリシーなし。返信番号は関数で生成して `return=minimal` で保存し、読取権限を追加せず返します。
- 10モデル・47県・150店舗・1,050登録。東京24、神奈川16、大阪16、愛知12店舗。
- 全体で各モデルの未登録率は30%。東京はモデルごとに25〜37.5%。
- `scripts/export-seed.ts` が唯一の生成元で、SQL・フロント用JSON・関数用の郵便番号座標JSONを同時生成します。
- 店舗名・住所・電話・郵便番号はデモ用です。代表座標も簡略化した合成データです。実在の郵便住所や道路距離を検索するものではありません。
- 郵便番号例：`1000001` / `1500001`（東京代表）、`2200001`（横浜代表）、`5300001`（大阪代表）、`4500001`（名古屋代表）。未定義の `9990000` は0件です。
- SQLは `on conflict do nothing` で再投入可能です。生成規則を変更して既存レコードを更新する場合は別途マイグレーションが必要です。

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

| 場所                                        | 役割                                                                    |
| ------------------------------------------- | ----------------------------------------------------------------------- |
| `src/app/`, `src/app/pages/`                | ルーティング、5画面                                                     |
| `src/components/`                           | propsだけで描画する店舗カード・バッジ、モデルカード、進行表示、日時入力 |
| `src/features/booking/`                     | React Contextの申し込み状態                                             |
| `src/features/dealers/`                     | 非同期検索フック、純粋な並び替え・フィルタ関数                          |
| `src/api/`                                  | fetchクライアント、検索フォールバック、申し込み送信                     |
| `src/data/seed/`                            | 同梱の検索・表示用データ                                                |
| `src/styles/`                               | デザイントークン、Tailwind共通スタイル                                  |
| `supabase/migrations/`, `supabase/seed.sql` | テーブル・RLS・デモデータ                                               |
| `supabase/functions/`                       | 検索、送信、共通入力検証                                                |
| `scripts/export-seed.ts`                    | SQLとJSONの再生成                                                       |

## セッションで変更される想定の箇所

### 案A：近い順＋試乗車ありを先頭（未実装）

- `src/features/dealers/sortDealers.ts`：`sortDealers` の比較順を変更、`filterDealers` を必要に応じて変更。
- `src/features/dealers/useDealerSearch.ts`：並び替え方の指定が必要になった場合の接続点。
- `src/components/DealerCard.tsx` / `TestCarBadge.tsx`：採用案の見た目をFigmaで磨いて差し替える箇所。
- `src/styles/tokens.css`：色・余白・角丸・文字サイズの調整。

県検索には距離がありません。「近い順」を県検索にも適用するなら、基準地点の入力とデータ仕様を検討する必要があります。現行APIが返す距離は郵便番号検索時だけです。

### 案B：日時を先に聞く（未実装）

- `src/components/PreferredDateTimeField.tsx`：独立した入力部品を移動・再利用。
- `src/app/pages/InfoInput.tsx`：元の入力箇所。
- `src/app/pages/DealerSelect.tsx` または新しい前段ページ：先に希望を聞く配置先。
- `src/app/App.tsx` / `src/components/StepIndicator.tsx`：必要に応じてルートとステップ表示を変更。
- `src/features/booking/BookingContext.tsx`：希望日時を保持する状態。
- `src/api/submitRequest.ts` / `supabase/functions/submit-request/index.ts`：希望として保存する契約を確認。

日時を先に聞いても空き枠を照会するAPIはありません。「空き」「確定」と表示せず、希望として受けるか、販売店システム連携を待つかをセッション内で判断します。案A・案Bは現行コードには実装していません。

## 判断・未設定事項

空のリポジトリだったため、提供された `AGENTS (1).md` をルートの `AGENTS.md` として採用しました。プロンプトとの要件矛盾はありません。接続値が未提供なので公開設定は空です。郵便番号代表座標・店舗情報・電話番号は合成データです。モデルと県の選択肢は同梱シードを使用し、店舗検索・送信のみEdge Functionへ接続します。

受付番号はUUID由来の `LM-` + 32桁です。Supabaseの実デプロイ・RLSの実DB確認・実通信での完了表示は接続後に必要です。自動テストは検索順、データ配分、フォールバック、送信契約、入力検証を対象としています。

## 郵便番号・都道府県検索と現在地デモの接続点

郵便番号検索は先頭3桁の代表点から半径30kmに限定します。都道府県検索は県内店舗のみ、コード順です。オンライン・オフラインとも同じ距離・範囲の純関数を使用します。30kmはデモ用の仮設定です。店舗座標は47都道府県それぞれの都市周辺に揃えた合成データです。

`1000001` と `1000002` は同じ100の代表点なので同じ結果です。東京 `1000001` と大阪 `5300001` を使うと地域の異なる結果を比較できます。7桁単位の正確な住所ジオコーディングは行っていません。

現在地からの初期表示をCode layersで作る場合は、`src/app/pages/DealerSelect.tsx` から `navigator.geolocation` で取得した緯度経度を検索へ渡す変更が必要です。共通の `nearbyDealers(rows, {lat, lng})` と `SEARCH_RADIUS_KM` を `supabase/functions/_shared/search.ts` に置き、フロントからは `src/features/dealers/sortDealers.ts` 経由で利用できます。API入力を座標に拡張する場合は `SearchInput`（`src/types.ts`）、`parseSearch`、検索APIとフォールバックの両方に座標経路を追加してください。位置情報の取得・座標APIの拡張自体は未実装です。

既にシードを投入したSupabaseは `supabase db push` で追加の座標補正マイグレーションを適用し、`supabase functions deploy search-dealers` で検索関数を更新してください。ローカルの同梱データには反映済みです。

## デモ用のAI画像

車種10枚・店舗外観3枚をbuilt-in image_genで生成し、`public/images/models/` と `public/images/dealers/` にJPEGとして同梱しています。外部画像サービスやSupabase Storageへの接続は不要です。生成プロンプトは `docs/image-generation.json`、割り当ては `src/data/images.ts` にあります。

店舗画像は150店舗に3種類を店舗コードから安定して割り当てます。実在の店舗写真・車両写真ではありません。`ModelCard` と `DealerCard` の任意の `imageSrc` propで個別の画像へ差し替えられます。車種・店舗の画像は遅延読込し、カード内に領域を確保します。

2026-10-22の「デモで見栄えるように画像を入れる」という追加指示に合わせ、AGENTS.mdのプレースホルダ指定も更新しました。ロゴはテキストのみです。

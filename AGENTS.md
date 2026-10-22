# toyota-codeLayers

架空ブランド「LUMIÈRE」の試乗申し込みデモ。React + TypeScript + Vite + Tailwind CSSで作られ、Figma Code layersでも動作します。

## Development Server

- 起動済みのプレビューがあれば、そのサーバーを使います。
- ローカル起動は `npm install` → `npm run dev`。既定ポートは5173です。
- Figmaではプレビューパネルを使います。ソースの変更はホットリロードで反映されます。

## Project Structure

依頼に関係するファイルから読み始め、必要な場合だけimport先や関連ファイルを確認してください。

- `src/main.tsx` — Reactのエントリーポイント、ルーターと申し込み状態の初期化
- `src/app/App.tsx` — ルーティングと共通レイアウト
- `src/app/pages/` — ModelSelect、DealerSelect、InfoInput、Confirm、Completeの5画面
- `src/components/` — 店舗・車両・モデルなどのドメイン部品
- `src/features/` — 申し込み状態、店舗検索、並び替えロジック
- `src/api/` — Supabase Edge Functionsの呼び出しとシードへのフォールバック
- `src/config.ts` / `src/config.public.ts` — 環境変数と公開接続設定
- `src/data/seed/` / `supabase/` — デモデータ、マイグレーション、Edge Functions
- `package.json` / `vite.config.ts` — スクリプト、依存関係、開発サーバー設定

## Dependencies

- Node.js 20（20.19以上）、npm
- React 18、React Router 7、TypeScript 5.7
- Vite 7、Tailwind CSS 4（PostCSS経由）
- Supabase、ESLint、Vitest

## Working Scope

- ユーザーが指定した画面・ブランチで作業します。改善案では検索UIや配置・操作順を変更できます。
- 分岐済みの案は既存ルート（例：`/dealers`）を置き換えます。依頼なしに案別ルートを追加しません。
- 複製元のコードレイヤーや、対象外の画面・APIは変更しません。
- データは架空です。申し込みは日時の確定予約ではなく、空き枠・仮押さえAPIはありません。
- 依存はpublic npmのみ。秘密鍵をコードに含めません。
- コード変更後は `npm run build` / `npm run lint` / `npm run typecheck` / `npm test` を確認します。

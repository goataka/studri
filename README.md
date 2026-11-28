# studri

小中学生が一人で学べる学習アプリ群。

- **学習の系統**：[curriculum](curriculum/README.md)
- **エージェントへの指示**：[AGENTS.md](AGENTS.md)

## コマンド

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm run build
pnpm run test
```

- **build**：`dist/` にビルドする。TypeScript のアプリは Vite でビルドし、ほかのアプリはそのままコピーする
- **test**：型の検査、単体テスト、E2E テストを順に実行する
- **E2E テスト**：`dist/` を配信して実行する。各アプリの feature と step は `apps/<app>/e2e/` に置く

# studri

## E2Eテスト

各アプリのGherkin featureとstep定義は `apps/<app>/e2e/` に置き、共通のPlaywright設定とローカルサーバーから実行します。

```sh
npm ci
npx playwright install chromium
npm run test:e2e
```

`npm run test:e2e` はすべてのアプリのfeatureを実行します。個別アプリのシナリオは `apps/<app>/e2e/*.feature` に追加し、対応するstep定義を同じ場所の `steps/` 以下に配置してください。
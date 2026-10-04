import { defineBddConfig } from "playwright-bdd";

export default {
  testDir: defineBddConfig({
    features: "apps/**/e2e/*.feature",
    steps: "apps/**/e2e/steps/*.ts",
    language: "ja",
  }),
  snapshotPathTemplate: "apps/math/division/e2e/screenshots/{arg}{ext}",
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    headless: true,
  },
  webServer: {
    command: "tsx tests/e2e/server.ts",
    url: "http://127.0.0.1:4173/apps/math/division/",
    reuseExistingServer: !process.env.CI,
    timeout: 10_000,
  },
};

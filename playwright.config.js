const { defineBddConfig } = require("playwright-bdd");

module.exports = {
  testDir: defineBddConfig({
    features: "apps/**/e2e/*.feature",
    steps: "apps/**/e2e/steps/*.js",
    language: "ja",
  }),
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    headless: true,
  },
  webServer: {
    command: "node tests/e2e/server.cjs",
    url: "http://127.0.0.1:4173/apps/division/",
    reuseExistingServer: !process.env.CI,
    timeout: 10_000,
  },
};

const { expect } = require("@playwright/test");
const { createBdd } = require("playwright-bdd");

const { Given, When, Then } = createBdd();

Given("算数アプリを開く", async ({ page }) => {
  await page.goto("/apps/division/");
});

When("選択中のコースで挑戦を始める", async ({ page }) => {
  await page.getByRole("button", { name: "このコースで挑戦する" }).click();
});

When("10問すべて正解して挑戦を終える", async ({ page }) => {
  await page.getByRole("button", { name: "このコースで挑戦する" }).click();
  await answerQuestions(page, 0, 10);
});

When("最初の問題で誤答して再回答する", async ({ page }) => {
  const correctAnswer = await currentAnswer(page);
  const wrongAnswer = correctAnswer === "0" ? "1" : "0";
  await page.locator("#answer").fill(wrongAnswer);
  await page.getByRole("button", { name: "答え合わせ" }).click();
  await expect(page.locator("#feedback")).toContainText("おしい！");
  await expect(page.locator("#feedback")).toContainText(`正解は「${correctAnswer}」です。`);
  await page.getByRole("button", { name: "再回答" }).click();
  await page.locator("#answer").fill(correctAnswer);
  await page.getByRole("button", { name: "答え合わせ" }).click();
  await expect(page.locator("#feedback")).toHaveClass(/ok/);
  await page.locator("#feedback").click();
});

When("残りの問題に正解して挑戦を終える", async ({ page }) => {
  await answerQuestions(page, 1, 10);
});

Then("結果に10問正解と表示される", async ({ page }) => {
  await expect(page.locator("#result")).toBeVisible();
  await expect(page.locator("#score")).toHaveText("10 / 10 問 正解");
});

When("コース選択に戻る", async ({ page }) => {
  await page.locator("#homeButton").click();
});

Then("今回の挑戦記録が保存される", async ({ page }) => {
  await expect(page.locator("#attempts")).toHaveText("1");
  await expect(page.locator("#streak")).toHaveText("1");
});

When("ページを再読み込みする", async ({ page }) => {
  await page.reload();
});

Then("挑戦記録が保持される", async ({ page }) => {
  await expect(page.locator("#attempts")).toHaveText("1");
  await expect(page.locator("#streak")).toHaveText("1");
});

When("学習記録の初期化を確定する", async ({ page }) => {
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#resetData").click();
});

Then("挑戦回数が0になる", async ({ page }) => {
  await expect(page.locator("#attempts")).toHaveText("0");
});

Then("誤答を記録し連続合格を0回にする", async ({ page }) => {
  await expect(page.locator("#wrongCount")).toHaveText("1問");
  await expect(page.locator("#reviewList .review-item")).toHaveCount(1);
  await expect(page.locator("#streak")).toHaveText("0");
});

async function answerQuestions(page, start, end) {
  for (let question = start; question < end; question += 1) {
    await expect(page.locator("#questionNo")).toHaveText(`${question + 1} / 10`);
    const answer = await currentAnswer(page);
    await page.locator("#answer").fill(answer);
    await page.getByRole("button", { name: "答え合わせ" }).click();
    await expect(page.locator("#feedback")).toHaveClass(/ok/);
    await page.locator("#feedback").click();
  }
}

async function currentAnswer(page) {
  const problem = await page.locator("#problem").textContent();
  const match = problem.match(/(\d+)\s*÷\s*(\d+)/);
  if (!match) throw new Error(`Unexpected division problem: ${problem}`);
  return String(Number(match[1]) / Number(match[2]));
}

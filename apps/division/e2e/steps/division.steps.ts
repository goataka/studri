import { expect, Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("算数アプリを開く", async ({ page }) => {
  await page.goto("/apps/division/");
});

When("コースを選んで挑戦を始める", async ({ page }) => {
  await page.locator('#courses [data-course="g3-table"]').click();
  await expect(page.locator("#quiz")).toBeVisible();
});

When("10問すべて正解して挑戦を終える", async ({ page }) => {
  await answerQuestions(page, 0, 10);
});

When("最初の問題で誤答して再回答する", async ({ page }) => {
  const correctAnswer = await currentAnswer(page);
  const wrongAnswer = correctAnswer === "0" ? "1" : "0";
  await page.locator("#answer").fill(wrongAnswer);
  await page.getByRole("button", { name: "答え合わせ" }).click();
  await expect(page.locator("#feedback")).toContainText("おしい！");
  await expect(page.locator("#feedback")).toContainText(`正解は「${correctAnswer}」です。`);
  await page.keyboard.press("Enter");
  await expect(page.locator("#feedback")).not.toBeVisible();
  await page.locator("#answer").fill(correctAnswer);
  await page.getByRole("button", { name: "答え合わせ" }).click();
  await expect(page.locator("#feedback")).toHaveClass(/ok/);
  await page.keyboard.press("Enter");
});

When("残りの問題に正解して挑戦を終える", async ({ page }) => {
  await answerQuestions(page, 1, 10);
});

Then("結果に10問正解と表示される", async ({ page }) => {
  await expect(page.locator("#result")).toBeVisible();
  await expect(page.locator("#score")).toHaveText("10 / 10 問 正解");
});

Then("ミスがあったことを結果に表示する", async ({ page }) => {
  await expect(page.locator("#resultTitle")).toHaveText("ぜんもん正解！");
  await expect(page.locator("#resultMessage")).toContainText("挑戦中にミスがあった");
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

Then("すごろくから問題文の下に計算エリアが表示される", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator("#courses .course")).toHaveCount(12);
  await expect(page.locator("#questionNo")).toHaveText("1 / 10");
  const columns = await page.locator(".quiz-board").evaluate((element) =>
    getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );
  expect(columns).toBe(1);
  const problem = await page.locator("#problem").boundingBox();
  const answer = await page.locator("#answer").boundingBox();
  expect(problem).not.toBeNull();
  expect(answer).not.toBeNull();
  expect(problem!.y + problem!.height).toBeLessThan(answer!.y);
});

Then("誤答を記録し連続合格を0回にする", async ({ page }) => {
  await expect(page.locator("#wrongCount")).toHaveText("1問");
  await expect(page.locator("#reviewList .review-item")).toHaveCount(1);
  await expect(page.locator("#streak")).toHaveText("0");
});

Then("コースは小学3年生のみで音とバージョンが表示される", async ({ page }) => {
  await expect(page.locator("#courses .course")).toHaveCount(12);
  await expect(page.locator("#courses .grade")).toHaveText(Array(12).fill("小学3年生"));
  await expect(page.locator("#sound")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".site-footer")).toHaveText(/^Ver\. \d{8}\.\d{6}\.\d{3}$/);
  await expect(page.locator("textarea")).toHaveCount(0);
});

async function answerQuestions(page: Page, start: number, end: number) {
  for (let question = start; question < end; question += 1) {
    await expect(page.locator("#questionNo")).toHaveText(`${question + 1} / 10`);
    const answer = await currentAnswer(page);
    await page.locator("#answer").fill(answer);
    await page.getByRole("button", { name: "答え合わせ" }).click();
    await expect(page.locator("#feedback")).toHaveClass(/ok/);
    await page.keyboard.press("Enter");
  }
}

async function currentAnswer(page: Page) {
  const problem = await page.locator("#problem").textContent();
  if (!problem) throw new Error("Division problem is missing");
  const match = problem.match(/(\d+)\s*÷\s*(\d+)/);
  if (!match) throw new Error(`Unexpected division problem: ${problem}`);
  return String(Number(match[1]) / Number(match[2]));
}

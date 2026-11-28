import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { parseWords, type KanjiEntry } from "../../src/parse-words";

const { Given, When, Then } = createBdd();

const APP = "/apps/japanese/kanji-g3/";
const specs = path.resolve(__dirname, "../../../../../specs/apps/kanji-g3");
const entries: KanjiEntry[] = ["words-1.md", "words-2.md"].flatMap((file) =>
  parseWords(readFileSync(path.join(specs, file), "utf8")),
);

async function currentAnswer(page: Page): Promise<string> {
  const text = await page.locator(".question .word").getAttribute("data-word");
  const isReading = (await page.locator(".type-label").textContent()) === "読み";
  const entry = entries.find((candidate) => candidate.words.some((word) => word.text === text));
  const word = entry?.words.find((candidate) => candidate.text === text);
  if (!entry || !word) throw new Error(`言葉がデータにない：${text}`);
  return isReading ? word.reading : entry.kanji;
}

function choice(page: Page, value: string) {
  return page.locator(`.choice[data-choice="${value}"]`);
}

Given("国語のページを開く", async ({ page }) => {
  await page.goto("/apps/japanese/");
});

When("国語のページから3年生の漢字のアプリを開く", async ({ page }) => {
  await page.getByRole("link", { name: /3年生の漢字/ }).click();
});

Given("3年生の漢字のアプリを開く", async ({ page }) => {
  await page.goto(APP);
});

Then("20のコースとバージョンが表示される", async ({ page }) => {
  await expect(page).toHaveTitle("スタドリ - 3年生の漢字編");
  await expect(page.locator(".course")).toHaveCount(20);
  await expect(page.locator(".course-name").first()).toHaveText("コース1 悪～飲");
  await expect(page.locator(".site-footer")).toHaveText(/^Ver\. \d{8}\.\d{6}\.\d{3}$/);
});

When("漢字のアプリをスマートフォン幅で見る", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
});

Then("横スクロールせずに漢字のコースを選べる", async ({ page }) => {
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", 320);
  await expect(page.locator('[data-action="practice"]').first()).toBeVisible();
});

When("コース1のれんしゅうを始める", async ({ page }) => {
  await page.locator('[data-action="practice"][data-course="course-01"]').click();
  await expect(page.locator(".progress")).toHaveText("1 / 10");
});

When("10問をすべて正しく答える", async ({ page }) => {
  for (let index = 0; index < 10; index += 1) {
    await choice(page, await currentAnswer(page)).click();
    await expect(page.locator("#feedbackTitle")).toHaveText("せいかい！");
    await page.locator('#feedback [data-action="next"]').click();
  }
});

Then("けっかに「{int} \\/ {int}」が表示される", async ({ page }, score: number, total: number) => {
  await expect(page.locator(".result .score")).toHaveText(`${score} / ${total}`);
});

When("コースの一らんにもどる", async ({ page }) => {
  await page.locator('[data-action="home"]').first().click();
});

Then(/^コース1に「(.+)」が表示される$/, async ({ page }, text: string) => {
  await expect(page.locator('[data-course-id="course-01"] .course-status')).toContainText(text);
});

When("まちがった答えを選ぶ", async ({ page }) => {
  const answer = await currentAnswer(page);
  await page.locator(`.choice:not([disabled]):not([data-choice="${answer}"])`).first().click();
});

Then("「ヒント」が表示される", async ({ page }) => {
  await expect(page.locator("#feedbackBody .hint")).toContainText("ヒント");
});

When("もう一ど答える", async ({ page }) => {
  await page.locator('#feedback [data-action="retry"]').click();
});

Then("正しい答えが表示される", async ({ page }) => {
  const answer = await currentAnswer(page);
  await expect(page.locator("#feedbackBody")).toContainText(`正しい答え：${answer}`);
});

When("まちがえた もんだいを開く", async ({ page }) => {
  await page.locator('#feedback [data-action="next"]').click();
  await page.locator('[data-action="back"]').click();
  await page.locator('[data-action="mistakes"]').click();
});

Then("まちがえた言葉が一らんに表示される", async ({ page }) => {
  await expect(page.locator(".mistakes li").first()).toContainText("えらんだ答え");
});

When("記録を消す", async ({ page }) => {
  await page.locator('[data-action="reset"]').click();
  await page.locator('#confirmReset [data-action="reset-confirm"]').click();
});

import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

const COURSE = "alphabet-1";

Given("フォニックスアプリを開く", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem("studri-phonics-v1");
    localStorage.removeItem("studri-phonics-v1-sound");
  });
  await page.goto("/apps/english/phonics/");
});

Given("固定された問題順のフォニックスアプリを開く", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem("studri-phonics-v1");
    Math.random = () => 0;
  });
  await page.goto("/apps/english/phonics/");
});

Then("フォニックスのコースと学習範囲が表示される", async ({ page }) => {
  await expect(page).toHaveTitle("スタドリ - 英語・フォニックス・カタカナ");
  await expect(page.getByRole("heading", { name: "フォニックスを学ぼう！" })).toBeVisible();
  await expect(page.locator("#courses .course")).toHaveCount(16);
  await expect(page.locator(".scope")).toContainText("母音");
  await expect(page.locator(".site-footer")).toHaveText("Ver. 20261031.110349.451");
  await expect(page.locator(".mascot img")).toHaveJSProperty("naturalWidth", 1024);
});

When("画面をスマートフォン幅にする", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
});

Then("横スクロールせずにコースを選べる", async ({ page }) => {
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", 320);
  await openCourseSection(page);
  await expect(page.locator(`#courses [data-course="${COURSE}"] button`).first()).toBeVisible();
});

When("アルファベットの子音①コースで挑戦を始める", async ({ page }) => {
  await openCourseSection(page);
  await page.locator(`#courses [data-course="${COURSE}"] .course-start`).click();
});

Then("コース一覧に「母音」と「子音」の見出しが表示される", async ({ page }) => {
  await expect(page.locator(".course-section")).toHaveText(["母音", "子音", "つづりのルール", "トリッキーワーズ"]);
  await expect(page.locator("#courses .course").first()).toHaveAttribute("data-course", "alphabet-4");
});

Then("選択肢に発音記号は表示されない", async ({ page }) => {
  const texts = await page.locator("#answers button").allTextContents();
  expect(texts).toHaveLength(4);
  for (const text of texts) expect(text).not.toContain("/");
});

Then("問題文の下に意味のヒントが表示される", async ({ page }) => {
  await expect(page.locator("#meaningHint")).toBeVisible();
  await expect(page.locator("#meaningHint")).toContainText("意味：");
});

Then("問題と回答ボタンが表示される", async ({ page }) => {
  await expect(page.locator("#quiz")).toBeVisible();
  await expect(page.locator("#answers button")).toHaveCount(4);
  await expect(page.locator("#meaningHint")).toContainText("意味：");
  await expect(page.locator("#writingCanvas")).toHaveCount(0);
});

When("まちがいを直しながら10問を終える", async ({ page }) => {
  for (let index = 0; index < 10; index += 1) {
    await page.locator("#answers button").last().click();
    const feedback = page.locator("#feedback");
    await expect(feedback).toBeVisible();
    if (await feedback.getAttribute("class").then((value) => value?.includes("no"))) {
      await feedback.getByRole("button", { name: "もういちど答える" }).click();
      await clickCorrectChoice(page);
    }
    await expect(feedback).toHaveClass(/ok/);
    await feedback.locator(".feedback-actions button").first().click();
  }
});

Then("全10問の結果と挑戦記録が保存される", async ({ page }) => {
  await expect(page.locator("#result")).toBeVisible();
  await expect(page.locator("#score")).toContainText("はじめから正解");
  await expect(page.locator("#score")).toContainText("/ 10 問");
  await expect(page.locator("#answerSummary article")).toHaveCount(10);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("studri-phonics-v1") || "{}"));
  expect(saved.stats[COURSE].attempts).toBe(1);
  expect(saved.history[0].completed).toBe(true);
  expect(saved.wrong.length).toBeGreaterThan(0);
});

When("コースの誤答ログを開く", async ({ page }) => {
  await page.locator("#homeButton").click();
  await openCourseSection(page);
  await page.locator(`#courses [data-course="${COURSE}"] .course-log`).first().click();
});

Then("誤答と正解と解説が表示される", async ({ page }) => {
  await expect(page.locator("#reviewPanel")).toBeVisible();
  await expect(page.locator("#reviewList .review-item").first()).toContainText("あなたの答え");
  await expect(page.locator("#reviewList .review-item").first()).toContainText("せいかい");
  await expect(page.locator("#reviewList .review-item").first()).toContainText("音");
});

When("最初の誤答を解き直して正解する", async ({ page }) => {
  const firstItem = page.locator("#reviewList .review-item").first();
  const savedCorrectAnswer = await page.evaluate<string>(
    `learningData.wrong.filter((entry) => entry.courseId === "${COURSE}").slice(-12).reverse()[0].correct`,
  );
  await firstItem.getByRole("button", { name: "この問題をとき直す" }).click();
  await expect(page.locator("#quiz")).toBeVisible();
  await expect(page.locator("#answers button")).toHaveCount(4);
  await page.locator(`#answers button[data-choice="${savedCorrectAnswer}"]`).click();
  const feedback = page.locator("#feedback");
  await expect(feedback).toHaveClass(/ok/);
  await feedback.locator(".feedback-actions button").first().click();
  await page.locator("#reviewBack").click();
  await openCourseSection(page);
  await page.locator(`#courses [data-course="${COURSE}"] .course-log`).first().click();
});

Then("解き直しが完了扱いになる", async ({ page }) => {
  await expect(page.locator("#reviewList .review-item").first()).toContainText("とき直しずみ");
});

When("学習データを確認して初期化する", async ({ page }) => {
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#resetData").click();
});

Then("学習記録が削除される", async ({ page }) => {
  await expect(page.locator("#reviewPanel")).toBeHidden();
  const saved = await page.evaluate(() => localStorage.getItem("studri-phonics-v1"));
  expect(saved).toBeNull();
  await expect(page.locator(`#courses [data-course="${COURSE}"]`)).toContainText("ちょうせん 0回");
});

When("挑戦を確認して中断する", async ({ page }) => {
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#quit").click();
});

Then("中断した挑戦が保存される", async ({ page }) => {
  await expect(page.locator("#home")).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("studri-phonics-v1") || "{}"));
  expect(saved.history[0].completed).toBe(false);
  expect(saved.history[0].abandonedAt).toBeGreaterThan(0);
});

When("3回のミスなし合格を達成する", async ({ page }) => {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await openCourseSection(page);
    await page.locator(`#courses [data-course="${COURSE}"] .course-start`).click();
    await answerTenCorrectly(page);
    if (attempt < 2) await page.locator("#homeButton").click();
  }
});

Then("合格後のチャレンジが解放される", async ({ page }) => {
  await expect(page.locator("#result")).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("studri-phonics-v1") || "{}"));
  expect(saved.stats[COURSE].streak).toBe(3);
  await expect(page.locator("#timeAttack")).toBeEnabled();
  await expect(page.locator("#chainAttack")).toBeEnabled();
});

When("タイムアタックを完了する", async ({ page }) => {
  await page.locator("#timeAttack").click();
  await answerTenCorrectly(page);
});

Then("タイムアタックの最高記録が保存される", async ({ page }) => {
  await expect(page.locator("#resultTitle")).toHaveText("⏱ タイムアタック");
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("studri-phonics-v1") || "{}"));
  expect(saved.stats[COURSE].timeBest).toBeGreaterThan(0);
});

When("連続正解チャレンジを完了する", async ({ page }) => {
  await page.locator("#chainAttack").click();
  await answerTenCorrectly(page);
});

Then("連続正解の最高記録が保存される", async ({ page }) => {
  await expect(page.locator("#resultTitle")).toHaveText("🔥 れんぞくせいかいチャレンジ");
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("studri-phonics-v1") || "{}"));
  expect(saved.stats[COURSE].chainBest).toBe(10);
});

// 出題中の正解の選択肢を押す（同じ読みの選択肢があっても正しいものを選ぶ）
async function clickCorrectChoice(page: import("@playwright/test").Page) {
  const answer = await page.evaluate<string>("quiz.questions[quiz.index].answer");
  await page.locator(`#answers button[data-choice="${answer}"]`).click();
}

async function answerTenCorrectly(page: import("@playwright/test").Page) {
  for (let index = 0; index < 10; index += 1) {
    await clickCorrectChoice(page);
    await expect(page.locator("#feedback")).toHaveClass(/ok/);
    await page.locator("#feedbackActions button").first().click();
  }
  await expect(page.locator("#result")).toBeVisible();
}

// コースはまとまりごとにたためるので、使う前にそのまとまりを開く
async function openCourseSection(page: import("@playwright/test").Page) {
  await page.locator(`#courses details:has([data-course="${COURSE}"])`)
    .evaluate((element) => { (element as HTMLDetailsElement).open = true; });
}

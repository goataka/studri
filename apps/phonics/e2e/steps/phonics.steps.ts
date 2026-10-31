import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("フォニックスアプリを開く", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem("studri-phonics-v1");
    localStorage.removeItem("studri-phonics-v1-sound");
  });
  await page.goto("/apps/phonics/");
});

Given("固定された問題順のフォニックスアプリを開く", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem("studri-phonics-v1");
    Math.random = () => 0;
  });
  await page.goto("/apps/phonics/");
});

Then("フォニックスのコースと学習範囲が表示される", async ({ page }) => {
  await expect(page).toHaveTitle("スタドリ - フォニックス編");
  await expect(page.getByRole("heading", { name: "フォニックスを学ぼう！" })).toBeVisible();
  await expect(page.locator("#courses .course")).toHaveCount(5);
  await expect(page.locator(".scope")).toContainText("短母音");
  await expect(page.locator(".site-footer")).toHaveText("Ver. 20261031.110349.451");
  await expect(page.locator(".mascot img")).toHaveJSProperty("naturalWidth", 1024);
});

Then("発音の答えはカタカナが先に表示され発音記号が添えられる", async ({ page }) => {
  await expect(page.locator("#answers button").first()).toHaveText("ス（/s/）");
  await expect(page.locator("#answers button").first()).toHaveAttribute("aria-label", "ス（/s/）");
});

When("画面をスマートフォン幅にする", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
});

Then("横スクロールせずにコースを選べる", async ({ page }) => {
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", 320);
  await expect(page.locator('#courses [data-course="alphabet"] button').first()).toBeVisible();
});

When("アルファベットの音コースで挑戦を始める", async ({ page }) => {
  await page.locator('#courses [data-course="alphabet"] .start-course').click();
});

Then("問題とタッチ回答と手書き練習欄が表示される", async ({ page }) => {
  await expect(page.locator("#quiz")).toBeVisible();
  await expect(page.locator("#answers button")).toHaveCount(4);
  await expect(page.locator("#writingCanvas")).toBeVisible();
  await expect(page.locator(".writing-note")).toContainText("手書き認識はしません");
});

When("まちがいを直しながら10問を終える", async ({ page }) => {
  const canvas = page.locator("#writingCanvas");
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("手書きキャンバスが表示されていません");
  await page.mouse.move(bounds.x + 30, bounds.y + 35);
  await page.mouse.down();
  await page.mouse.move(bounds.x + 120, bounds.y + 72);
  await page.mouse.up();

  for (let index = 0; index < 10; index += 1) {
    await page.locator("#answers button").last().click();
    const feedback = page.locator("#feedback");
    await expect(feedback).toBeVisible();
    if (await feedback.getAttribute("class").then((value) => value?.includes("no"))) {
      const correctAnswer = (await feedback.locator(".feedback-answer").textContent())
        ?.replace(/^正解：「|」$/g, "");
      if (!correctAnswer) throw new Error("正解がフィードバックに表示されていません");
      await feedback.getByRole("button", { name: "再回答" }).click();
      await page.getByRole("button", { name: correctAnswer, exact: true }).click();
      await expect(feedback).toHaveClass(/ok/);
    } else {
      await expect(feedback).toHaveClass(/ok/);
    }
    await feedback.locator(".feedback-actions button").first().click();
  }
});

Then("全10問の結果と挑戦記録が保存される", async ({ page }) => {
  await expect(page.locator("#result")).toBeVisible();
  await expect(page.locator("#score")).toHaveText("10 / 10 問 正解");
  await expect(page.locator("#answerSummary article")).toHaveCount(10);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("studri-phonics-v1") || "{}"));
  expect(saved.stats.alphabet.attempts).toBe(1);
  expect(saved.history[0].completed).toBe(true);
  expect(saved.wrong.length).toBeGreaterThan(0);
  expect(saved.wrong.some((entry: { trace?: string }) => entry.trace?.startsWith("data:image/png"))).toBe(true);
});

When("コースの誤答ログを開く", async ({ page }) => {
  await page.locator("#homeButton").click();
  await page.locator('#courses [data-course="alphabet"] .outline').first().click();
});

Then("誤答と正解と解説が表示される", async ({ page }) => {
  await expect(page.locator("#reviewPanel")).toBeVisible();
  await expect(page.locator("#reviewList .review-item").first()).toContainText("あなたの答え");
  await expect(page.locator("#reviewList .review-item").first()).toContainText("正解");
  await expect(page.locator("#reviewList .review-item").first()).toContainText("音");
});

When("最初の誤答を解き直して正解する", async ({ page }) => {
  const firstItem = page.locator("#reviewList .review-item").first();
  const savedCorrectAnswer = await firstItem.innerText()
    .then((text) => text.match(/正解：(\S+)/)?.[1]);
  if (!savedCorrectAnswer) throw new Error("誤答ログに正解が表示されていません");
  await firstItem.getByRole("button", { name: "この問題を解き直す" }).click();
  await expect(page.locator("#quiz")).toBeVisible();
  await expect(page.locator("#answers button")).toHaveCount(4);
  await page.getByRole("button", { name: savedCorrectAnswer, exact: true }).click();
  const feedback = page.locator("#feedback");
  await expect(feedback).toHaveClass(/ok/);
  await feedback.locator(".feedback-actions button").first().click();
  await page.locator("#reviewBack").click();
  await page.locator('#courses [data-course="alphabet"] .outline').first().click();
});

Then("解き直しが完了扱いになる", async ({ page }) => {
  await expect(page.locator("#reviewList .review-item").first()).toContainText("解き直し済み");
});

When("学習データを確認して初期化する", async ({ page }) => {
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#resetData").click();
});

Then("学習記録と手書き記録が削除される", async ({ page }) => {
  await expect(page.locator("#reviewPanel")).toBeHidden();
  const saved = await page.evaluate(() => localStorage.getItem("studri-phonics-v1"));
  expect(saved).toBeNull();
  await expect(page.locator('#courses [data-course="alphabet"]')).toContainText("挑戦 0回");
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
    await page.locator('#courses [data-course="alphabet"] .start-course').click();
    await answerTenKnownQuestions(page);
    if (attempt < 2) await page.locator("#homeButton").click();
  }
});

Then("合格後のチャレンジが解放される", async ({ page }) => {
  await expect(page.locator("#result")).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("studri-phonics-v1") || "{}"));
  expect(saved.stats.alphabet.streak).toBe(3);
  await expect(page.locator("#timeAttack")).toBeEnabled();
  await expect(page.locator("#chainAttack")).toBeEnabled();
});

When("タイムアタックを完了する", async ({ page }) => {
  await page.locator("#timeAttack").click();
  await answerTenKnownQuestions(page);
});

Then("タイムアタックの最高記録が保存される", async ({ page }) => {
  await expect(page.locator("#resultTitle")).toHaveText("⏱ タイムアタック");
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("studri-phonics-v1") || "{}"));
  expect(saved.stats.alphabet.timeBest).toBeGreaterThan(0);
});

When("連続正解チャレンジを完了する", async ({ page }) => {
  await page.locator("#chainAttack").click();
  await answerTenKnownQuestions(page);
});

Then("連続正解の最高記録が保存される", async ({ page }) => {
  await expect(page.locator("#resultTitle")).toHaveText("🔥 連続正解チャレンジ");
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("studri-phonics-v1") || "{}"));
  expect(saved.stats.alphabet.chainBest).toBe(10);
});

async function answerTenKnownQuestions(page: import("@playwright/test").Page) {
  const answers: Record<string, string> = {
    sun: "ス（/s/）", map: "ム（/m/）", fish: "フ（/f/）", dog: "ド（/d/）", bag: "b",
    kite: "k", top: "ト（/t/）", van: "ヴ（/v/）", zip: "z", red: "r",
    jam: "j", queen: "qu", box: "クス（/ks/）", yes: "ヤ行（/j/）",
  };
  for (let index = 0; index < 10; index += 1) {
    const word = await page.locator("#wordCard").textContent();
    const answer = word ? answers[word] : undefined;
    if (!answer) throw new Error(`未登録のフォニックス問題: ${word}`);
    await page.getByRole("button", { name: answer, exact: true }).click();
    await expect(page.locator("#feedback")).toHaveClass(/ok/);
    await page.locator("#feedbackActions button").first().click();
  }
  await expect(page.locator("#result")).toBeVisible();
}

import { expect, Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("算数アプリを開く", async ({ page }) => {
  await page.goto("/apps/division/");
});

When("コースを選んで挑戦を始める", async ({ page }) => {
  await page.locator('#courses [data-course="g3-one-digit-exact"]').click();
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
  await expect(page.locator("#feedback")).toContainText("ヒント：");
  await expect(page.locator("#feedback")).not.toContainText(`正解は「${correctAnswer}」です。`);
  await expect(page.getByRole("button", { name: "もう一度" })).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.locator("#feedback")).not.toBeVisible();
  await page.locator("#answer").fill(correctAnswer);
  await page.getByRole("button", { name: "答え合わせ" }).click();
  await expect(page.locator("#feedback")).toHaveClass(/ok/);
  await page.keyboard.press("Enter");
});

When("最初の問題で誤答して答えを確認する", async ({ page }) => {
  const correctAnswer = await currentAnswer(page);
  const wrongAnswer = correctAnswer === "0" ? "1" : "0";
  await page.locator("#answer").fill(wrongAnswer);
  await page.getByRole("button", { name: "答え合わせ" }).click();
  await expect(page.locator("#feedback")).toContainText("ヒント：");
  await expect(page.locator("#feedback")).not.toContainText(`正解は「${correctAnswer}」です。`);
  await page.getByRole("button", { name: "答えを確認" }).click();
  await expect(page.locator("#feedback")).toContainText(`正解は「${correctAnswer}」です。`);
  await expect(page.locator("#feedbackActions")).toHaveText("次へ");
  await page.getByRole("button", { name: "次へ" }).click();
  await expect(page.locator("#questionNo")).toHaveText("2 / 10");
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
  const course = page.locator('#courses [data-course="g3-one-digit-exact"]');
  await expect(course.locator(".course-attempts")).toContainText("挑戦 1回");
  await expect(course.locator(".course-progress-count")).toHaveText("1 / 3回");
});

When("ページを再読み込みする", async ({ page }) => {
  await page.reload();
});

Then("挑戦記録が保持される", async ({ page }) => {
  const course = page.locator('#courses [data-course="g3-one-digit-exact"]');
  await expect(course.locator(".course-attempts")).toContainText("挑戦 1回");
  await expect(course.locator(".course-progress-count")).toHaveText("1 / 3回");
});

When("学習記録の初期化を確定する", async ({ page }) => {
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#resetData").click();
});

Then("挑戦回数が0になる", async ({ page }) => {
  await expect(page.locator(".course-attempts")).toHaveCount(9);
  await expect(page.locator(".course-attempts")).toContainText(Array(9).fill("挑戦 0回"));
});

Then("トレイルから問題文の下に計算エリアが表示される", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator("#courses .course")).toHaveCount(9);
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
  await expect(page.locator('#courses [data-course="g3-one-digit-exact"] .course-progress-count')).toHaveText("0 / 3回");
});

Then("コースは小学3年生のみで音とバージョンが表示される", async ({ page }) => {
  await expect(page.locator("#courses .course")).toHaveCount(9);
  await expect(page.locator("#courses .grade")).toHaveText(Array(9).fill("小学3年生"));
  await expect(page).toHaveTitle("スタドリ - 算数・３年生・わり算編");
  await expect(page.locator("#statsTitle")).toHaveCount(0);
  await expect(page.locator(".course-progress-count")).toHaveText(Array(9).fill("0 / 3回"));
  await expect(page.locator(".course-challenges span")).toHaveText(
    Array(9).fill(["⏱ タイムアタック", "🔥 連続正解チャレンジ"]).flat(),
  );
  await expect(page.locator(".course-unlock")).toHaveText(Array(9).fill("ミスなしであと3回合格すると解放"));
  await expect(page.locator("#sound")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".site-footer")).toHaveText(/^Ver\. \d{8}\.\d{6}\.\d{3}$/);
  await expect(page.locator("textarea")).toHaveCount(0);
});

Then("9つのコースが指定順に並び問題が範囲内で出る", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const courses = [
    ["g3-meaning-story", "文章題（割り算の意味）", "meaning"],
    ["g3-one-digit-exact", "1桁 ÷ 1桁（九九の範囲・あまりなし）", "one-digit-exact"],
    ["g3-two-digit-exact", "2桁 ÷ 1桁（九九の範囲・あまりなし）", "two-digit-exact"],
    ["g3-exact-story", "文章題（九九の範囲・あまりなし）", "exact-story"],
    ["g3-one-digit-remainder", "1桁 ÷ 1桁（九九の範囲・あまりあり）", "one-digit-remainder"],
    ["g3-two-digit-remainder", "2桁 ÷ 1桁（九九の範囲・あまりあり）", "two-digit-remainder"],
    ["g3-remainder-story", "文章題（九九の範囲・あまりあり）", "remainder-story"],
    ["g3-zero-one", "０や１のわり算", "zero-one"],
    ["g3-two-digit-mental", "2桁 ÷ 1桁（九九を超える暗算）", "mental"],
  ];

  await expect(page.locator("#courses .course")).toHaveCount(courses.length);
  await expect(page.locator("#courses .course strong")).toHaveText(courses.map(([, name]) => name));
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const positions = await page.locator("#courses .course").evaluateAll((elements) =>
      elements.map((element) => {
        const { x, y } = element.getBoundingClientRect();
        return { x, y };
      }),
    );
    for (let index = 1; index < positions.length; index += 1) {
      expect(positions[index].x).toBe(positions[0].x);
      expect(positions[index].y).toBeGreaterThan(positions[index - 1].y);
    }
    const columns = await page.locator("#courses").evaluate((element) =>
      getComputedStyle(element).gridTemplateColumns.split(" ").length,
    );
    expect(columns).toBe(1);
  }
  const lastArrow = await page.locator("#courses .course:last-child").evaluate((element) =>
    getComputedStyle(element, "::after").content,
  );
  expect(lastArrow).toBe("none");

  await page.evaluate(() => {
    localStorage.setItem("studri-division-v1", JSON.stringify({
      course: "g3-meaning-story",
      stats: { "g3-meaning-story": { streak: 3, attempts: 4, best: 23 } },
      wrong: [],
    }));
  });
  await page.reload();
  const passedCourse = page.locator('#courses [data-course="g3-meaning-story"]');
  await expect(passedCourse.locator(".course-progress-count")).toHaveText("3 / 3回");
  await expect(passedCourse.locator(".course-attempts")).toHaveText("挑戦 4回 ・ ベスト 23秒");
  await expect(passedCourse.locator(".course-unlock")).toHaveText("チャレンジ解放！");
  await expect(passedCourse).toHaveAttribute("aria-label", /タイムアタック/);

  for (const [id, , type] of courses) {
    await page.locator(`#courses [data-course="${id}"]`).click();
    const problem = (await page.locator("#problem").textContent()) || "";
    const operands = [...problem.matchAll(/\d+/g)].slice(0, 2).map(([number]) => Number(number));
    expect(operands).toHaveLength(2);
    const [dividend, divisor] = operands;
    expect(divisor).toBeGreaterThan(0);

    if (type === "meaning") {
      expect(problem).not.toContain("÷");
    } else if (type === "one-digit-exact") {
      expect(dividend).toBeLessThan(10);
      expect(divisor).toBeLessThan(10);
      expect(dividend % divisor).toBe(0);
    } else if (type === "two-digit-exact" || type === "exact-story") {
      expect(dividend).toBeGreaterThanOrEqual(10);
      expect(dividend).toBeLessThan(100);
      expect(divisor).toBeLessThan(10);
      expect(dividend / divisor).toBeLessThanOrEqual(9);
      expect(dividend % divisor).toBe(0);
      if (type === "exact-story") expect(problem).not.toContain("÷");
    } else if (type === "one-digit-remainder") {
      expect(dividend).toBeLessThan(10);
      expect(divisor).toBeLessThan(10);
      expect(dividend % divisor).toBeGreaterThan(0);
    } else if (type === "two-digit-remainder" || type === "remainder-story") {
      expect(dividend).toBeGreaterThanOrEqual(10);
      expect(dividend).toBeLessThan(100);
      expect(divisor).toBeLessThan(10);
      expect(dividend / divisor).toBeLessThan(10);
      expect(dividend % divisor).toBeGreaterThan(0);
      if (type === "remainder-story") expect(problem).not.toContain("÷");
    } else if (type === "zero-one") {
      expect(dividend === 0 || divisor === 1).toBe(true);
    } else {
      expect(dividend).toBeGreaterThanOrEqual(10);
      expect(dividend).toBeLessThan(100);
      expect(divisor).toBeGreaterThan(1);
      expect(divisor).toBeLessThan(10);
      expect(Math.floor(dividend / divisor)).toBeGreaterThan(9);
    }

    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("#quit").click();
    await expect(page.locator("#home")).toBeVisible();
  }
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
  const operands = [...problem.matchAll(/\d+/g)].slice(0, 2).map(([number]) => Number(number));
  if (operands.length !== 2 || operands[1] === 0) throw new Error(`Unexpected division problem: ${problem}`);
  const [dividend, divisor] = operands;
  const quotient = Math.floor(dividend / divisor);
  const remainder = dividend % divisor;
  return problem.includes("あまる") ? `${quotient}あまり${remainder}` : String(quotient);
}

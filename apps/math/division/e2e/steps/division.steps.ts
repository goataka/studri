import { expect, Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("算数アプリを開く", async ({ page }) => {
  await page.goto("/apps/math/division/");
});

Given("画面確認用に算数アプリを開く", async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0.5;
  });
  await page.goto("/apps/math/division/");
});

Given("スタドリホームを開く", async ({ page }) => {
  await page.goto("/");
});

When("算数のリンクを選ぶ", async ({ page }) => {
  await page.locator('a[href="apps/math/"]').click();
});

Then("算数トップページを表示する", async ({ page }) => {
  await expect(page).toHaveTitle("スタドリ - 算数編");
  await expect(page.locator(".breadcrumbs [aria-current='page']")).toHaveText("🔢 算数");
  await expect(page.locator(".breadcrumbs a").first()).toHaveAttribute("href", "../../");
  await expect(page.locator(".mascot img")).toHaveJSProperty("naturalWidth", 1024);
  await page.setViewportSize({ width: 320, height: 740 });
  const heading = await page.locator(".hero h1").boundingBox();
  const headingText = await page.locator(".hero h1").evaluate((element) => ({
    text: element.textContent,
    lines: getComputedStyle(element).whiteSpace,
    height: element.getBoundingClientRect().height,
    lineHeight: Number.parseFloat(getComputedStyle(element).lineHeight),
  }));
  expect(headingText.text).toBe("算数を学ぼう！");
  expect(headingText.lines).toBe("nowrap");
  expect(headingText.height).toBeLessThanOrEqual(headingText.lineHeight);
  expect(heading).not.toBeNull();
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", 320);
  await page.setViewportSize({ width: 1280, height: 720 });
});

When("モバイル表示に切り替える", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
});

When("デスクトップ表示に切り替える", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
});

When("復習ノートを表示する", async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem("studri-division-v1", JSON.stringify({
      course: "g3-one-digit-exact",
      stats: {},
      wrong: [{ grade: 3, courseId: "g3-one-digit-exact", problem: "10 ÷ 2 =", answer: "4", correct: "5", explain: "2×5=10" }],
    }));
  });
  await page.reload();
  await page.locator('#courses [data-course="g3-one-digit-exact"] .course-log').click();
});

When("コース一覧を表示する", async ({ page }) => {
  await page.locator("#reviewBack").click();
});

Then("わり算コースへ進める", async ({ page }) => {
  await expect(page).toHaveTitle("スタドリ - 算数編");
  await expect(page.getByRole("link", { name: /3年生・わり算/ })).toHaveAttribute("href", "division/");
  await page.getByRole("link", { name: /3年生・わり算/ }).click();
  await expect(page).toHaveTitle("スタドリ - 算数・３年生・わり算編");
  await expect(page.locator("#courses")).toBeVisible();
  await expect(page.locator(".mascot img")).toHaveJSProperty("naturalWidth", 1024);
});

When("現在の問題に誤答する", async ({ page }) => {
  const correctAnswer = await currentAnswer(page);
  await page.locator("#answer").fill(correctAnswer === "0" ? "1" : "0");
  await page.getByRole("button", { name: "答え合わせ" }).click();
  await expect(page.locator("#feedback")).toHaveClass(/no/);
});

When("誤答を修正して正解する", async ({ page }) => {
  const correctAnswer = await currentAnswer(page);
  await page.getByRole("button", { name: "もう一度" }).click();
  await page.locator("#answer").fill(correctAnswer);
  await page.getByRole("button", { name: "答え合わせ" }).click();
  await expect(page.locator("#feedback")).toHaveClass(/ok/);
  await expect(page.locator("#feedbackActions button").first()).toHaveText("つぎへ ↵");
});

When("Enterキーで次の問題へ進む", async ({ page }) => {
  await page.keyboard.press("Enter");
});

Then(/VR画像 "(.*)" を確認する/, async ({ page }, screenshotName: string) => {
  const feedback = page.locator("#feedback");
  if (await feedback.isVisible()) {
    await expect(feedback).toHaveScreenshot(screenshotName, { animations: "disabled" });
    return;
  }

  await expect(page).toHaveScreenshot(screenshotName, {
    animations: "disabled",
    caret: "hide",
    fullPage: true,
  });
});

When("コースを選んで挑戦を始める", async ({ page }) => {
  await page.locator('#courses [data-course="g3-one-digit-exact"] .course-start').click();
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
  await expect(page.locator("#feedbackActions button").first()).toHaveText("もう一度 ↵");
  await page.keyboard.press("Enter");
  await expect(page.locator("#feedback")).not.toBeVisible();
  await page.locator("#answer").fill(correctAnswer);
  await page.getByRole("button", { name: "答え合わせ" }).click();
  await expect(page.locator("#feedback")).toHaveClass(/ok/);
  await expect(page.locator("#feedbackActions button").first()).toHaveText("つぎへ ↵");
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
  await expect(page.locator("#feedbackActions")).toHaveText("次へ ↵");
  await page.getByRole("button", { name: "次へ ↵" }).click();
  await expect(page.locator("#questionNo")).toHaveText("2 / 10");
});

When("残りの問題に正解して挑戦を終える", async ({ page }) => {
  await answerQuestions(page, 1, 10);
});

Then("結果に10問正解と表示される", async ({ page }) => {
  await expect(page.locator("#result")).toBeVisible();
  await expect(page.locator("#score")).toHaveText("10 / 10 問 正解");
  await expect(page.locator("#again")).toHaveText(/(?:続けて|もう一度)挑戦する ↵/);
  await expect(page.getByRole("link", { name: "算数ページに戻る" })).toHaveAttribute("href", "#home");
});

Then("ミスがあったことを結果に表示する", async ({ page }) => {
  await expect(page.locator("#resultTitle")).toHaveText("ぜんもん正解！");
  await expect(page.locator("#resultMessage")).toContainText("途中でミスがあった");
  await expect(page.locator("#again")).toHaveText("もう一度挑戦する ↵");
});

When("コース選択に戻る", async ({ page }) => {
  await page.locator("#homeButton").click();
});

Then("今回の挑戦記録が保存される", async ({ page }) => {
  const course = page.locator('#courses [data-course="g3-one-digit-exact"]');
  await expect(course.locator(".course-step.current")).toHaveText("🥈");
});

When("ページを再読み込みする", async ({ page }) => {
  await page.reload();
});

Then("挑戦記録が保持される", async ({ page }) => {
  const course = page.locator('#courses [data-course="g3-one-digit-exact"]');
  await expect(course.locator(".course-step.current")).toHaveText("🥈");
});

Then("画面幅に応じた位置に計算エリアが表示される", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator("#courses .course")).toHaveCount(9);
  await expect(page.locator("#questionNo")).toHaveText("1 / 10");
  const columns = await page.locator(".quiz-board").evaluate((element) =>
    getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );
  expect(columns).toBe(2);
  const desktopBoard = await page.locator(".quiz-board").boundingBox();
  const desktopQuestion = await page.locator(".quiz-question").boundingBox();
  const desktopAnswer = await page.locator(".quiz-response").boundingBox();
  const desktopWork = await page.locator(".quiz-work").boundingBox();
  expect(desktopBoard).not.toBeNull();
  expect(desktopQuestion).not.toBeNull();
  expect(desktopAnswer).not.toBeNull();
  expect(desktopWork).not.toBeNull();
  const desktopPrimary = await page.locator(".quiz-primary").boundingBox();
  expect(desktopPrimary).not.toBeNull();
  expect(desktopQuestion!.x + desktopQuestion!.width).toBeLessThanOrEqual(desktopWork!.x);
  expect(desktopAnswer!.x + desktopAnswer!.width).toBeLessThanOrEqual(desktopWork!.x);
  const problemCenter = desktopQuestion!.x + desktopQuestion!.width / 2;
  const primaryCenter = desktopPrimary!.x + desktopPrimary!.width / 2;
  expect(Math.abs(problemCenter - primaryCenter)).toBeLessThanOrEqual(1);
  const workArea = await page.locator(".canvas-box").boundingBox();
  expect(workArea).not.toBeNull();
  expect(workArea!.width).toBeGreaterThan(desktopPrimary!.width);
  const desktopCanvas = await page.locator("#noteCanvas").boundingBox();
  expect(desktopCanvas).not.toBeNull();
  expect(desktopCanvas!.height).toBeGreaterThanOrEqual(desktopWork!.height * 0.85);
  await expect(page.locator("#answerCanvas")).toHaveCount(0);
  await expect(page.locator("#noteCanvas")).toBeVisible();
  await expect(page.locator(".quiz-work")).toHaveAttribute("aria-label", "計算エリア");
  await expect(page.locator("#noteCanvas")).toHaveAttribute("aria-label", "計算エリア。手書きで計算できます");
  await expect(page.locator(".canvas-box")).toHaveCount(1);
  const canvas = await page.locator("#noteCanvas").boundingBox();
  expect(canvas).not.toBeNull();
  await page.mouse.move(canvas!.x + 10, canvas!.y + 10);
  await page.mouse.down();
  await page.mouse.move(canvas!.x + 40, canvas!.y + 20);
  await page.mouse.up();
  const hasHandwriting = await page.locator("#noteCanvas").evaluate((element) => {
    const canvasElement = element as HTMLCanvasElement;
    const context = canvasElement.getContext("2d");
    if (!context) return false;
    const pixels = context.getImageData(0, 0, canvasElement.width, canvasElement.height).data;
    return pixels.some((value, index) => index % 4 === 3 && value > 0);
  });
  expect(hasHandwriting).toBe(true);
  const keypadButton = await page.locator("#keypad button").first().boundingBox();
  expect(keypadButton).not.toBeNull();
  expect(keypadButton!.height).toBeGreaterThanOrEqual(42);
  expect(keypadButton!.height).toBeLessThanOrEqual(44);

  await page.setViewportSize({ width: 390, height: 844 });
  const mobilePrimary = await page.locator(".quiz-primary").boundingBox();
  const mobileWork = await page.locator(".quiz-work").boundingBox();
  expect(mobilePrimary).not.toBeNull();
  expect(mobileWork).not.toBeNull();
  expect(mobileWork!.y).toBeGreaterThanOrEqual(mobilePrimary!.y + mobilePrimary!.height);
  const mobileColumns = await page.locator(".quiz-board").evaluate((element) =>
    getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );
  expect(mobileColumns).toBe(1);
});

Then("誤答を記録し連続合格を0回にする", async ({ page }) => {
  await expect(page.locator('#courses [data-course="g3-one-digit-exact"] .course-step.start-dot.current')).toHaveCount(1);
  await page.locator('#courses [data-course="g3-one-digit-exact"] .course-log').click();
  await expect(page.locator("#reviewList .review-item")).toHaveCount(1);
  await expect(page.locator("#reviewTitle")).toHaveText("📜 ログ：1桁 ÷ 1桁（九九の範囲・あまりなし）");
  await page.locator("#reviewBack").click();
  await expect(page.locator('#courses [data-course="g3-meaning-story"] .course-log')).toBeDisabled();
  await page.locator('#courses [data-course="g3-one-digit-exact"] .course-log').click();
  await expect(page.locator("#reviewList .review-item")).toHaveCount(1);
});

Then("算数ページのパンくずと音・初期化ボタンとバージョンが表示される", async ({ page }) => {
  await expect(page.locator("#courses .course")).toHaveCount(9);
  await expect(page.locator("#courses .grade")).toHaveCount(0);
  await expect(page).toHaveTitle("スタドリ - 算数・３年生・わり算編");
  await expect(page.locator("#statsTitle")).toHaveCount(0);
  await expect(page.locator(".course-challenge")).toHaveText(
    Array(9).fill(["⏱ タイムアタック", "🔥 連続正解"]).flat(),
  );
  await expect(page.locator(".course-challenge:disabled")).toHaveCount(18);
  await expect(page.locator("#courses .course").first().locator(".course-step")).toHaveText(["", "🥇", "🥈", "🥉"]);
  await expect(page.locator(".course-pass-pin")).toHaveCount(0);
  await expect(page.locator(".course-challenge-control").first()).toHaveAttribute("title", "あと3回で解放");
  await expect(page.locator("body")).not.toContainText("あと3回で解放");
  await expect(page.locator("body")).not.toContainText("解放済み");
  await expect(page.locator(".course-log")).toHaveText(Array(9).fill("📜 ログ"));
  await expect(page.locator(".course-tools-group .course-group-label")).toHaveText(Array(9).fill("🧰 ツール"));
  await expect(page.locator(".course-log:disabled")).toHaveCount(9);
  await expect(page.locator("#resetData")).toHaveAttribute("aria-label", "学習データを初期化");
  await expect(page.locator(".course-group-label")).toHaveText([
    ...Array(9).fill(["🌱 ベーシック", "🌳 チャレンジ", "🧰 ツール"]).flat(),
  ]);
  const challengeIconSize = Number.parseFloat(await page.locator(".course-challenge-icon").first().evaluate((element) =>
    getComputedStyle(element).fontSize,
  ));
  const challengeTextSize = Number.parseFloat(await page.locator(".course-challenge").first().evaluate((element) =>
    getComputedStyle(element).fontSize,
  ));
  expect(challengeIconSize).toBeGreaterThan(challengeTextSize);
  await expect(page.locator("#courses .course-log")).toHaveCount(9);
  await expect(page.locator("#courses .course-log:disabled")).toHaveCount(9);
  await expect(page.locator("#sound")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#sound")).toHaveAttribute("aria-label", "音あり");
  await expect(page.locator("#sound")).toHaveText("🔊");
  await expect(page.locator(".breadcrumbs a").first()).toContainText("スタドリ");
  await expect(page.locator(".breadcrumbs a").first()).toHaveAttribute("href", "../../");
  await expect(page.locator(".breadcrumbs [aria-current='page']")).toHaveText("🔢 算数");
  await expect(page.locator(".breadcrumbs [aria-current='page']")).toHaveAttribute("href", "../");
  await expect(page.locator(".hero-copy h1")).toHaveText("3年生・わり算");
  const mascotDecoration = await page.locator(".mascot").evaluate((element) =>
    getComputedStyle(element, "::after").content,
  );
  expect(mascotDecoration).not.toBe('"÷"');
  await expect(page.locator(".tabs")).toHaveCount(0);
  await expect(page.locator(".hero-copy")).not.toContainText("トレイルを");
  await expect(page.locator(".hero-copy")).not.toContainText("小学3年生の算数");
  const mascotPosition = await page.locator(".mascot").boundingBox();
  const heroCopyPosition = await page.locator(".hero-copy").boundingBox();
  expect(mascotPosition).not.toBeNull();
  expect(heroCopyPosition).not.toBeNull();
  expect(mascotPosition!.x).toBeLessThan(heroCopyPosition!.x);
  await expect(page.locator(".site-footer")).toHaveText(/^Ver\. \d{8}\.\d{6}\.\d{3}$/);
  await expect(page.locator("textarea")).toHaveCount(0);
});

Then("続けて挑戦するボタンがチャレンジより上に表示される", async ({ page }) => {
  await expect(page.locator("#again")).toHaveText("続けて挑戦する ↵");
  await expect(page.locator("#again")).toBeFocused();
  const again = await page.locator("#again").boundingBox();
  const challenges = await page.locator(".challenge-grid").boundingBox();
  expect(again).not.toBeNull();
  expect(challenges).not.toBeNull();
  expect(again!.y + again!.height).toBeLessThan(challenges!.y);
  const result = await page.locator(".result").boundingBox();
  expect(result).not.toBeNull();
  expect(again!.x + again!.width / 2).toBeCloseTo(result!.x + result!.width / 2, 0);
});

When("Enterキーで続けて挑戦する", async ({ page }) => {
  await page.keyboard.press("Enter");
});

Then("新しい挑戦が始まる", async ({ page }) => {
  await expect(page.locator("#quiz")).toBeVisible();
  await expect(page.locator("#questionNo")).toHaveText("1 / 10");
});

When("学習記録と復習ノートを作って初期化する", async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem("studri-division-v1", JSON.stringify({
      course: "g3-one-digit-exact",
      stats: { "g3-one-digit-exact": { streak: 2, attempts: 2, best: 23 } },
      wrong: [{ grade: 3, courseId: "g3-one-digit-exact", problem: "10 ÷ 2 =", answer: "4", correct: "5", explain: "2×5=10" }],
    }));
  });
  await page.reload();
  await expect(page.locator('#courses [data-course="g3-one-digit-exact"] .course-log-count')).toHaveText("1");
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#resetData").click();
});

Then("学習データが初期化される", async ({ page }) => {
  await expect(page.locator("#courses .course-log-count")).toHaveCount(0);
  await expect(page.locator('#courses [data-course="g3-one-digit-exact"] .course-log')).toBeDisabled();
  await expect(page.locator('#courses [data-course="g3-one-digit-exact"] .course-step.current')).toHaveCount(1);
  await expect(page.locator("#home")).toBeVisible();
  await expect(page.locator("#quiz")).toBeHidden();
});

Then("コース一覧に進捗ステップと解放条件つきボタンが表示される", async ({ page }) => {
  const courses = page.locator("#courses .course");
  await expect(page.locator("#courses")).toHaveAttribute("aria-label", "小学3年生のコース一覧");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(courses).toHaveCount(9);
  await expect(page.locator(".course-begin")).toContainText("ベーシックを3つ進めよう！チャレンジできるようになるよ♪間違えたらログから確認してみてね。");
  await expect(page.locator(".course-begin small")).toHaveCSS("white-space", "nowrap");
  await expect(page.locator(".course-guide")).toHaveCount(0);
  await expect(page.locator(".course-goal")).toContainText("おめでとう！たくさん頑張ったね♪次にも挑戦してみてね。");
  const desktopColumns = await page.locator("#courses").evaluate((element) =>
    getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );
  expect(desktopColumns).toBe(1);
  const desktopPositions = await courses.evaluateAll((elements) =>
    elements.map((element) => {
      const { x, y } = element.getBoundingClientRect();
      return { x, y };
    }),
  );
  for (let index = 1; index < desktopPositions.length; index += 1) {
    expect(desktopPositions[index].x).toBe(desktopPositions[0].x);
    expect(desktopPositions[index].y).toBeGreaterThan(desktopPositions[index - 1].y);
  }
  await expect(courses.first().locator(".course-start")).toHaveCSS("display", "grid");
  await expect(page.locator(".course-steps .course-step")).toHaveCount(36);
  const stepPositions = await courses.locator(".course-steps").evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect().x),
  );
  expect(new Set(stepPositions).size).toBe(1);
  const firstCourse = courses.first();
  await expect(firstCourse.locator(".course-log")).toBeDisabled();
  await expect(page.locator(".course-begin .course-log, .course-goal .course-log")).toHaveCount(0);
  const begin = page.locator(".course-begin");
  const beginBounds = await begin.boundingBox();
  const firstCourseBoundsForTrail = await firstCourse.boundingBox();
  const beginTrail = await begin.evaluate((element) => {
    const { top, left, height, width } = getComputedStyle(element, "::after");
    return { top: Number.parseFloat(top), left: Number.parseFloat(left), height: Number.parseFloat(height), width: Number.parseFloat(width) };
  });
  expect(beginBounds).not.toBeNull();
  expect(firstCourseBoundsForTrail).not.toBeNull();
  expect(beginTrail.top).toBeCloseTo(beginBounds!.height, 0);
  expect(beginTrail.height).toBeCloseTo(firstCourseBoundsForTrail!.y - (beginBounds!.y + beginBounds!.height), 0);
  await expect(begin).toHaveCSS("border-top-width", "0px");
  await expect(firstCourse).not.toHaveAttribute("data-step", /\d+/);
  const title = await firstCourse.locator(".course-copy").boundingBox();
  const progress = await firstCourse.locator(".course-progress").boundingBox();
  const steps = await firstCourse.locator(".course-steps").boundingBox();
  const firstChallenge = await firstCourse.locator(".course-challenge").first().boundingBox();
  const firstStep = await firstCourse.locator(".course-step").nth(1).boundingBox();
  const firstCourseBounds = await firstCourse.boundingBox();
  const courseSide = await firstCourse.locator(".course-side").boundingBox();
  const courseLog = await firstCourse.locator(".course-log").boundingBox();
  const basicLabel = await firstCourse.locator(".course-group-label").first().boundingBox();
  const challengeLabel = await firstCourse.locator(".course-challenge-group .course-group-label").boundingBox();
  const connectorLeft = await firstCourse.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element, "::after").left),
  );
  const titleFontSize = Number.parseFloat(await firstCourse.locator(".course-copy strong").evaluate((element) =>
    getComputedStyle(element).fontSize,
  ));
  expect(title).not.toBeNull();
  expect(progress).not.toBeNull();
  expect(steps).not.toBeNull();
  expect(firstChallenge).not.toBeNull();
  expect(firstStep).not.toBeNull();
  expect(firstCourseBounds).not.toBeNull();
  expect(courseSide).not.toBeNull();
  expect(courseLog).not.toBeNull();
  expect(beginTrail.left).toBeCloseTo(connectorLeft, 0);
  expect(basicLabel).not.toBeNull();
  expect(challengeLabel).not.toBeNull();
  expect(challengeLabel!.x).toBeCloseTo(firstChallenge!.x, 0);
  expect(challengeLabel!.y).toBeCloseTo(basicLabel!.y, 0);
  expect(connectorLeft).toBeCloseTo(title!.x - (await firstCourse.boundingBox())!.x + titleFontSize / 2, 0);
  expect(progress!.x).toBeGreaterThanOrEqual(title!.x + title!.width);
  expect(steps!.width / 4).toBeGreaterThanOrEqual(22);
  expect(firstChallenge!.x).toBeGreaterThan(steps!.x + steps!.width);
  expect(firstChallenge!.height).toBe(firstStep!.height);
  expect(courseLog!.x).toBeGreaterThan(courseSide!.x + courseSide!.width);
  expect(Math.abs(courseLog!.x + courseLog!.width - (firstCourseBounds!.x + firstCourseBounds!.width - 20))).toBeLessThanOrEqual(1);
  await expect(firstCourse.locator(".course-copy strong")).toHaveCSS("font-size", "19.2px");
  await expect(firstCourse.locator(".course-step").nth(1)).toHaveCSS("width", "54px");
  await expect(firstCourse.locator(".course-step").nth(1)).toHaveCSS("font-size", "24px");
  await expect(firstCourse.locator(".course-step.current")).toHaveCSS("background-color", "rgb(217, 120, 67)");
  const lastCourse = courses.last();
  const lastCourseBounds = await lastCourse.boundingBox();
  const goal = page.locator(".course-goal");
  const goalBounds = await goal.boundingBox();
  expect(lastCourseBounds).not.toBeNull();
  expect(goalBounds).not.toBeNull();
  expect(goalBounds!.width).toBe(lastCourseBounds!.width);
  expect(goalBounds!.y).toBe(lastCourseBounds!.y + lastCourseBounds!.height + 22);
  await expect(goal).toHaveCSS("border-top-width", "0px");
  const finalTrail = await lastCourse.evaluate((element) => {
    const style = getComputedStyle(element, "::after");
    return { height: Number.parseFloat(style.height), left: Number.parseFloat(style.left) };
  });
  expect(finalTrail.height).toBeCloseTo(goalBounds!.y - (lastCourseBounds!.y + lastCourseBounds!.height), 0);
  expect(finalTrail.left).toBeCloseTo(connectorLeft, 0);
  await expect(lastCourse).toHaveCSS("border-radius", "16px");
  await expect(goal.locator("strong")).toHaveCSS("font-size", await lastCourse.locator("strong").evaluate((element) =>
    getComputedStyle(element).fontSize,
  ));
  await expect(goal).toHaveCSS("display", "flex");
  const courseIconSize = Number.parseFloat(await firstCourse.locator(".course-icon").evaluate((element) =>
    getComputedStyle(element).fontSize,
  ));
  const courseTextSize = Number.parseFloat(await firstCourse.locator("strong").evaluate((element) =>
    getComputedStyle(element).fontSize,
  ));
  expect(courseIconSize).toBeGreaterThan(courseTextSize);
  const groupIconSize = Number.parseFloat(await firstCourse.locator(".course-group-icon").first().evaluate((element) =>
    getComputedStyle(element).fontSize,
  ));
  const groupTextSize = Number.parseFloat(await firstCourse.locator(".course-group-label").first().evaluate((element) =>
    getComputedStyle(element).fontSize,
  ));
  expect(groupIconSize).toBeGreaterThan(groupTextSize);

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileColumns = await page.locator("#courses").evaluate((element) =>
    getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );
  expect(mobileColumns).toBe(1);
  const mobileGuide = page.locator(".course-begin small");
  await expect(mobileGuide).toHaveCSS("white-space", "normal");
  const guideLayout = await mobileGuide.evaluate((element) => ({
    height: element.getBoundingClientRect().height,
    fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
  }));
  expect(guideLayout.height).toBeGreaterThan(guideLayout.fontSize * 2);
  expect(guideLayout.scrollWidth).toBeLessThanOrEqual(guideLayout.clientWidth);
  const mobileStepPositions = await courses.locator(".course-steps").evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect().x),
  );
  expect(new Set(mobileStepPositions).size).toBe(1);
  const mobileCard = await firstCourse.boundingBox();
  const mobileTools = await firstCourse.locator(".course-tools-group").boundingBox();
  const mobileLog = await firstCourse.locator(".course-log").boundingBox();
  expect(mobileCard).not.toBeNull();
  expect(mobileTools).not.toBeNull();
  expect(mobileLog).not.toBeNull();
  expect(Math.abs(mobileLog!.x - (mobileCard!.x + 12))).toBeLessThanOrEqual(1);
  await expect(firstCourse.locator(".course-tools-group .course-group-label")).toHaveText("🧰 ツール");
});

Then("9つのコースが指定順に並び問題が範囲内で出る", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const courses = [
    ["g3-meaning-story", "📖 文章題（割り算の意味）", "meaning"],
    ["g3-one-digit-exact", "🔢 1桁 ÷ 1桁（九九の範囲・あまりなし）", "one-digit-exact"],
    ["g3-two-digit-exact", "🔢 2桁 ÷ 1桁（九九の範囲・あまりなし）", "two-digit-exact"],
    ["g3-exact-story", "📖 文章題（九九の範囲・あまりなし）", "exact-story"],
    ["g3-one-digit-remainder", "🔢 1桁 ÷ 1桁（九九の範囲・あまりあり）", "one-digit-remainder"],
    ["g3-two-digit-remainder", "🔢 2桁 ÷ 1桁（九九の範囲・あまりあり）", "two-digit-remainder"],
    ["g3-remainder-story", "📖 文章題（九九の範囲・あまりあり）", "remainder-story"],
    ["g3-zero-one", "🔢 ０や１のわり算", "zero-one"],
    ["g3-two-digit-mental", "🔢 2桁 ÷ 1桁（九九を超える暗算）", "mental"],
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
    const columns = await page.locator("#courses").evaluate((element) =>
      getComputedStyle(element).gridTemplateColumns.split(" ").length,
    );
    expect(columns).toBe(1);
    for (let index = 1; index < positions.length; index += 1) {
      expect(positions[index].x).toBe(positions[0].x);
      expect(positions[index].y).toBeGreaterThan(positions[index - 1].y);
    }
  }

  await page.evaluate(() => {
    localStorage.setItem("studri-division-v1", JSON.stringify({
      course: "g3-meaning-story",
      stats: { "g3-meaning-story": { streak: 1, attempts: 2, best: 23 } },
      wrong: [],
    }));
  });
  await page.reload();
  const passedCourse = page.locator('#courses [data-course="g3-meaning-story"]');
  await expect(passedCourse.locator(".course-step.complete")).toHaveCount(2);
  const pin = passedCourse.locator(".course-pass-pin");
  await expect(pin).toHaveText("📍");
  const courseBounds = await passedCourse.boundingBox();
  const pinBounds = await pin.boundingBox();
  expect(courseBounds).not.toBeNull();
  expect(pinBounds).not.toBeNull();
  expect(pinBounds!.x).toBeLessThan(courseBounds!.x);
  expect(pinBounds!.y + pinBounds!.height / 2).toBeCloseTo(courseBounds!.y + courseBounds!.height / 2, 0);
  await expect(passedCourse.locator(".course-step.start-dot")).toHaveCSS("background-color", "rgb(251, 230, 213)");
  await expect(passedCourse.locator(".course-step.current")).toHaveText("🥈");
  await expect(passedCourse.locator(".course-step.current")).toHaveCSS("background-color", "rgb(217, 120, 67)");
  await expect(passedCourse.locator(".course-challenge")).toHaveText(["⏱ タイムアタック", "🔥 連続正解"]);

  await page.evaluate(() => {
    localStorage.setItem("studri-division-v1", JSON.stringify({
      course: "g3-meaning-story",
      stats: { "g3-meaning-story": { streak: 3, attempts: 4, best: 23 } },
      wrong: [],
    }));
  });
  await page.reload();
  const fullyPassedCourse = page.locator('#courses [data-course="g3-meaning-story"]');
  await expect(fullyPassedCourse.locator(".course-step.complete")).toHaveCount(4);
  await expect(fullyPassedCourse.locator(".course-pass-pin")).toHaveCount(1);
  await expect(fullyPassedCourse.locator(".course-step.complete").first()).toHaveCSS("background-color", "rgb(251, 230, 213)");
  await expect(fullyPassedCourse.locator(".course-challenge-group")).toHaveClass(/is-next/);
  await expect(fullyPassedCourse.locator(".course-challenge:not(:disabled)").first()).toHaveCSS("background-color", "rgb(217, 120, 67)");
  await expect(fullyPassedCourse.locator(".course-step.current")).toHaveCount(0);
  await expect(fullyPassedCourse.locator(".course-step.final")).toHaveText("🥉");
  await expect(page.locator(".course-goal")).toHaveCount(1);
  const challengeTitles = await fullyPassedCourse.locator(".course-challenge-control").evaluateAll((elements) =>
    elements.map((element) => element.hasAttribute("title")),
  );
  expect(challengeTitles).toEqual([false, false]);
  await expect(fullyPassedCourse.locator(".course-start")).not.toHaveAttribute("aria-label", /解放済み/);
  await expect(fullyPassedCourse.locator(".course-challenge:disabled")).toHaveCount(0);

  for (const [id, , type] of courses) {
    await page.locator(`#courses [data-course="${id}"] .course-start`).click();
    const problem = (await page.locator("#problem").textContent()) || "";
    const operands = [...problem.matchAll(/\d+/g)].slice(0, 2).map(([number]) => Number(number));
    expect(operands).toHaveLength(2);
    const [dividend, divisor] = operands;
    expect(divisor).toBeGreaterThan(0);

    if (type === "meaning") {
      expect(problem).not.toContain("÷");
      expect(dividend % divisor).toBe(0);
      expect(divisor).toBeLessThan(10);
      expect(dividend / divisor).toBeLessThanOrEqual(9);
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

"use strict";

const STORAGE_KEY = "studri-division-v1";
const SOUND_KEY = `${STORAGE_KEY}-sound`;
const QUIZ_LENGTH = 10;
const PASS_STREAK = 3;
const MAX_WRONG_ENTRIES = 30;
const MAX_REVIEW_ENTRIES = 8;
const COURSE_PROGRESS_STEPS = 4;
const MAX_QUIZ_LEVEL = QUIZ_LENGTH - 1;
const MIN_DIVISOR = 2;
const MAX_SINGLE_DIGIT = 9;
const MIN_TWO_DIGIT = 10;
const MAX_TWO_DIGIT = 99;
const STUDENT_GRADE = 3;
const INITIAL_DIVISOR_LIMIT = 3;
const MAX_MEANING_DIVISOR = 5;
const INITIAL_MEANING_QUOTIENT_LIMIT = 3;
const INITIAL_EXACT_QUOTIENT_LIMIT = 4;
const INITIAL_MENTAL_QUOTIENT_LIMIT = 12;
const MENTAL_QUOTIENT_LEVEL_STEP = 2;
const MIN_MENTAL_QUOTIENT = 10;
const STORY_SHARING_CHANCE = 0.5;
const MODE_STATUS_REFRESH_MS = 500;
const FEEDBACK_AUTO_ADVANCE_MS = 3000;
const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MAX_CANVAS_SNAPSHOT_WIDTH = 360;
const CANVAS_BRUSH_WIDTH = 3;
const COURSE_IDS = new Set([
  "g3-meaning-story",
  "g3-one-digit-exact",
  "g3-two-digit-exact",
  "g3-exact-story",
  "g3-one-digit-remainder",
  "g3-two-digit-remainder",
  "g3-remainder-story",
  "g3-zero-one",
  "g3-two-digit-mental",
]);

const courses = [
  {
    id: "g3-meaning-story",
    emoji: "📖",
    name: "文章題（割り算の意味）",
    desc: "分ける・いくつ分の場面を考えよう",
    type: "meaning",
  },
  {
    id: "g3-one-digit-exact",
    emoji: "🔢",
    name: "1桁 ÷ 1桁（九九の範囲・あまりなし）",
    desc: "九九を使って、ぴったり分けよう",
    type: "one-digit-exact",
  },
  {
    id: "g3-two-digit-exact",
    emoji: "🔢",
    name: "2桁 ÷ 1桁（九九の範囲・あまりなし）",
    desc: "2桁の数を九九でぴったり分けよう",
    type: "two-digit-exact",
  },
  {
    id: "g3-exact-story",
    emoji: "📖",
    name: "文章題（九九の範囲・あまりなし）",
    desc: "文章題を読んで、ぴったり分けよう",
    type: "exact-story",
  },
  {
    id: "g3-one-digit-remainder",
    emoji: "🔢",
    name: "1桁 ÷ 1桁（九九の範囲・あまりあり）",
    desc: "1桁のわり算で、商とあまりを答えよう",
    type: "one-digit-remainder",
  },
  {
    id: "g3-two-digit-remainder",
    emoji: "🔢",
    name: "2桁 ÷ 1桁（九九の範囲・あまりあり）",
    desc: "九九を使って、商とあまりを見つけよう",
    type: "two-digit-remainder",
  },
  {
    id: "g3-remainder-story",
    emoji: "📖",
    name: "文章題（九九の範囲・あまりあり）",
    desc: "文章題で、商とあまりを考えよう",
    type: "remainder-story",
  },
  {
    id: "g3-zero-one",
    emoji: "🔢",
    name: "０や１のわり算",
    desc: "0をわる計算や、1でわる計算に挑戦",
    type: "zero-one",
  },
  {
    id: "g3-two-digit-mental",
    emoji: "🔢",
    name: "2桁 ÷ 1桁（九九を超える暗算）",
    desc: "商が10以上になる計算を暗算しよう",
    type: "two-digit-mental",
  },
];

const challengeModes = [
  { emoji: "⏱", label: "タイムアタック", mode: "time" },
  { emoji: "🔥", label: "連続正解", mode: "chain" },
];

const defaultData = () => ({ course: "g3-meaning-story", stats: {}, wrong: [] });
const loadData = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved || typeof saved !== "object") return defaultData();

    const stats = Object.fromEntries(
      Object.entries(saved.stats || {}).filter(([courseId]) => COURSE_IDS.has(courseId)),
    );
    const wrong = Array.isArray(saved.wrong)
      ? saved.wrong
        .filter((entry) => entry && entry.grade === STUDENT_GRADE)
        .slice(-MAX_WRONG_ENTRIES)
      : [];
    return {
      course: COURSE_IDS.has(saved.course) ? saved.course : "g3-meaning-story",
      stats,
      wrong,
    };
  } catch {
    return defaultData();
  }
};

let learningData = loadData();
let selectedCourse = learningData.course;
let quiz = null;
let locked = false;
let advanceTimer = null;
let soundEnabled = localStorage.getItem(SOUND_KEY) !== "false";
let audioContext = null;
let workCanvas = null;
const canvasResizers = [];

const getElementById = (id) => document.getElementById(id);
const saveLearningData = () =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(learningData));
const resizeCanvases = () => canvasResizers.forEach((resize) => resize());

function renderCourses() {
  const courseList = getElementById("courses");
  courseList.replaceChildren();

  courses.forEach((course) => courseList.append(createCourseCard(course)));
  courseList.prepend(createCourseMarker("begin"));
  courseList.append(createCourseMarker("goal"));
  renderCourseProgress();
}

function createCourseCard(course) {
  const card = document.createElement("article");
  card.className = `course${selectedCourse === course.id ? " selected" : ""}`;
  card.dataset.course = course.id;

  const startButton = createCourseStartButton(course);
  const side = document.createElement("div");
  side.className = "course-side";
  side.append(createChallengeGroup(course));
  card.append(startButton, side, createCourseTools(course));
  return card;
}

function createCourseStartButton(course) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "course-start";

  const copy = document.createElement("span");
  copy.className = "course-copy";
  const name = document.createElement("strong");
  const icon = createIcon("course-icon", course.emoji);
  name.append(icon, document.createTextNode(` ${course.name}`));
  const description = document.createElement("small");
  description.textContent = course.desc;
  copy.append(name, description);

  const details = document.createElement("span");
  details.className = "course-details";
  details.append(createBasicProgress());
  button.append(copy, details);
  button.addEventListener("click", () => startCourse(course));
  return button;
}

function createBasicProgress() {
  const progress = document.createElement("span");
  progress.className = "course-progress";
  const group = document.createElement("span");
  group.className = "course-group";

  const label = document.createElement("span");
  label.className = "course-group-label";
  label.append(createIcon("course-group-icon", "🌱"), document.createTextNode(" ベーシック"));
  const steps = document.createElement("span");
  steps.className = "course-steps";
  steps.setAttribute("aria-hidden", "true");
  const medals = ["", "🥇", "🥈", "🥉"];
  medals.forEach((medal, index) => steps.append(createCourseStep(index, medal)));
  group.append(label, steps);
  progress.append(group);
  return progress;
}

function createCourseStep(index, medal) {
  const step = document.createElement("span");
  const isStart = index === 0;
  const isFinal = index === COURSE_PROGRESS_STEPS - 1;
  step.className = `course-step${isStart ? " start-dot" : ""}${isFinal ? " final" : ""}`;
  step.textContent = medal;
  return step;
}

function createChallengeGroup(course) {
  const group = document.createElement("div");
  group.className = "course-challenge-group";
  const label = document.createElement("span");
  label.className = "course-group-label";
  label.append(createIcon("course-group-icon", "🌳"), document.createTextNode(" チャレンジ"));
  const challenges = document.createElement("div");
  challenges.className = "course-challenges";
  challenges.setAttribute("aria-label", "合格後のチャレンジ");
  challengeModes.forEach((mode) => challenges.append(createChallenge(course, mode)));
  group.append(label, challenges);
  return group;
}

function createChallenge(course, mode) {
  const control = document.createElement("span");
  control.className = "course-challenge-control";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "course-challenge";
  button.dataset.mode = mode.mode;
  const icon = createIcon("course-challenge-icon", mode.emoji);
  const label = document.createElement("span");
  label.className = "course-challenge-label";
  label.textContent = ` ${mode.label}`;
  const record = document.createElement("span");
  record.className = "course-challenge-record";
  button.append(icon, label, record);
  button.addEventListener("click", () => startCourse(course, mode.mode));
  control.append(button);
  return control;
}

function createCourseTools(course) {
  const group = document.createElement("div");
  group.className = "course-tools-group";
  const label = document.createElement("span");
  label.className = "course-group-label";
  label.textContent = "🧰 ツール";
  const logButton = document.createElement("button");
  logButton.type = "button";
  logButton.className = "course-log";
  logButton.dataset.reviewCourse = course.id;
  logButton.setAttribute("aria-label", `📜 ログ：${course.name}`);
  logButton.addEventListener("click", () => showCourseLog(course));
  group.append(label, logButton);
  return group;
}

function createIcon(className, symbol) {
  const icon = document.createElement("span");
  icon.className = className;
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = symbol;
  return icon;
}

function createCourseMarker(type) {
  const isStart = type === "begin";
  const marker = document.createElement("div");
  marker.className = isStart ? "course-begin" : "course-goal";
  const copy = document.createElement("span");
  copy.className = "course-copy";
  const label = document.createElement("strong");
  const icon = createIcon("course-icon", isStart ? "🧭" : "🚩");
  label.append(icon, document.createTextNode(isStart ? " スタート" : " ゴール"));
  const message = document.createElement("small");
  message.textContent = isStart
    ? `ベーシックを${PASS_STREAK}つ進めるとチャレンジできるよ♪`
    : "おめでとう！がんばったね♪次のコースも進もう！";
  copy.append(label, message);
  marker.append(copy);
  return marker;
}

function startCourse(course, mode = "basic") {
  selectedCourse = course.id;
  learningData.course = selectedCourse;
  saveLearningData();
  renderCourses();
  renderStats();
  setupQuiz(mode);
}

function renderCourseProgress() {
  courses.forEach(updateCourseProgress);
}

function updateCourseProgress(course) {
  const card = getElementById("courses").querySelector(`[data-course="${course.id}"]`);
  if (!card) return;

  const stats = getCourseStats(course.id);
  const streak = Math.min(stats.streak, PASS_STREAK);
  updatePassPin(card, stats.streak);
  updateCourseSteps(card, streak);
  updateChallengeProgress(card, stats, streak);
  updateCourseStart(card, course, streak);
  updateCourseLogButton(card, course);
}

function getCourseStats(courseId) {
  return learningData.stats[courseId] || { streak: 0, attempts: 0, best: null };
}

function updatePassPin(card, streak) {
  let pin = card.querySelector(".course-pass-pin");
  if (streak > 0 && !pin) {
    pin = document.createElement("span");
    pin.className = "course-pass-pin";
    pin.textContent = "📍";
    pin.setAttribute("aria-label", "ベーシック合格");
    card.prepend(pin);
    return;
  }
  if (streak === 0) pin?.remove();
}

function updateCourseSteps(card, streak) {
  const completedCourse = streak >= PASS_STREAK;
  card.querySelector(".course-challenge-group").classList.toggle("is-next", completedCourse);
  card.classList.toggle("is-basic-complete", completedCourse);
  card.querySelectorAll(".course-step").forEach((step, index) => {
    const currentStep = index === (streak === 0 ? 0 : streak + 1);
    const completedStep = (index === 0 && streak > 0) || (index > 0 && index <= streak);
    step.classList.toggle("current", currentStep && !completedCourse);
    step.classList.toggle("complete", completedStep);
  });
}

function updateChallengeProgress(card, stats, streak) {
  card.querySelectorAll(".course-challenge").forEach((button) => {
    const lockedChallenge = stats.streak < PASS_STREAK;
    const record = getChallengeRecord(button.dataset.mode, stats);
    button.disabled = lockedChallenge;
    button.querySelector(".course-challenge-record").textContent = record;
    button.setAttribute(
      "aria-label",
      `${button.querySelector(".course-challenge-label").textContent.trim()} 記録 ${record}`,
    );
    updateChallengeUnlockLabel(button.parentElement, lockedChallenge, streak);
  });
}

function getChallengeRecord(mode, stats) {
  const record = mode === "time" ? stats.timeBest : stats.chainBest;
  if (!record) return "--";
  return mode === "time" ? `${record}秒` : `${record}問`;
}

function updateChallengeUnlockLabel(control, lockedChallenge, streak) {
  if (!lockedChallenge) {
    control.removeAttribute("title");
    return;
  }
  control.title = `あと${PASS_STREAK - streak}回で解放`;
}

function updateCourseStart(card, course, streak) {
  const button = card.querySelector(".course-start");
  button.disabled = streak >= PASS_STREAK;
  if (button.disabled) button.title = "ベーシック合格済み";
  else button.removeAttribute("title");
  button.setAttribute(
    "aria-label",
    `小学3年生、${course.name}。${course.desc}。合格ステップ ${streak}回。`,
  );
}

function updateCourseLogButton(card, course) {
  const button = card.querySelector(".course-log");
  const mistakeCount = learningData.wrong.filter((entry) => entry.courseId === course.id).length;
  const label = document.createElement("span");
  label.textContent = "📜 ログ";
  const record = document.createElement("span");
  record.className = "course-log-count";
  record.textContent = mistakeCount ? `${mistakeCount}件` : "--";
  button.replaceChildren(label, record);
  button.disabled = mistakeCount === 0;
  button.title = mistakeCount === 0
    ? "このコースの誤答ログはありません"
    : `${mistakeCount}件の誤答ログ`;
}

function renderStats() {
  renderCourseProgress();
}

function showCourseLog(course) {
  getElementById("coursesPanel").classList.add("hidden");
  getElementById("reviewPanel").classList.remove("hidden");
  getElementById("reviewTitle").textContent = `📜 ログ：${course.name}`;
  const reviewList = getElementById("reviewList");
  reviewList.replaceChildren();
  const courseMistakes = learningData.wrong.filter((entry) => entry.courseId === course.id);
  if (courseMistakes.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "このコースのまちがいはまだありません。挑戦してみよう！";
    reviewList.append(emptyMessage);
    return;
  }

  courseMistakes.slice(-MAX_REVIEW_ENTRIES).reverse().forEach((entry) => {
    reviewList.append(createReviewItem(entry));
  });
}

function createReviewItem(entry) {
  const item = document.createElement("div");
  item.className = "review-item";
  const problem = document.createElement("b");
  problem.textContent = entry.problem;
  const answer = document.createElement("div");
  answer.textContent = `あなたの答え：${entry.answer || "未入力"} / 正解：${entry.correct}`;
  const explanation = document.createElement("small");
  explanation.textContent = entry.explain;
  const checkButton = createReviewCheckButton(entry, item);
  item.append(problem, answer, explanation, checkButton);
  if (typeof entry.work === "string" && entry.work.startsWith("data:image/png")) {
    item.append(createReviewWorkImage(entry.work));
  }
  syncReviewCheck(entry, item, checkButton);
  return item;
}

function createReviewCheckButton(entry, item) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "review-check";
  button.addEventListener("click", () => {
    entry.checked = !entry.checked;
    saveLearningData();
    syncReviewCheck(entry, item, button);
  });
  return button;
}

function syncReviewCheck(entry, item, button) {
  const isChecked = Boolean(entry.checked);
  button.setAttribute("aria-pressed", String(isChecked));
  button.textContent = isChecked ? "✅ 確認済み" : "☐ 確認済み";
  item.classList.toggle("checked", isChecked);
}

function createReviewWorkImage(workData) {
  const image = document.createElement("img");
  image.className = "review-work";
  image.src = workData;
  image.alt = "そのときの計算エリア";
  return image;
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeProblem(problemIndex) {
  const course = courses.find((item) => item.id === selectedCourse);
  const level = Math.min(problemIndex, MAX_QUIZ_LEVEL);
  const operands = chooseProblemOperands(getProblemOperands(course.type, level));
  const [dividend, divisor, remainder = 0] = operands;

  if (isStoryCourse(course.type)) {
    return makeStoryProblem(
      dividend,
      divisor,
      remainder,
      Math.random() < STORY_SHARING_CHANCE,
    );
  }
  return makeDivisionProblem(dividend, divisor, remainder);
}

function getProblemOperands(courseType, level) {
  switch (courseType) {
    case "meaning":
      return getMeaningOperands(level);
    case "one-digit-exact":
      return getOneDigitExactOperands(level);
    case "two-digit-exact":
    case "exact-story":
      return getTwoDigitExactOperands(level);
    case "one-digit-remainder":
    case "two-digit-remainder":
    case "remainder-story":
      return getRemainderOperands(courseType, level);
    case "zero-one":
      return getZeroOneOperands(level);
    case "two-digit-mental":
      return getMentalDivisionOperands(level);
    default:
      throw new Error(`Unknown division course type: ${courseType}`);
  }
}

function getMeaningOperands(level) {
  const pairs = [];
  const maxDivisor = Math.min(
    MAX_MEANING_DIVISOR,
    MIN_DIVISOR + Math.floor(level / 2),
  );
  const maxQuotient = Math.min(
    MAX_SINGLE_DIGIT,
    INITIAL_MEANING_QUOTIENT_LIMIT + level,
  );
  for (let divisor = MIN_DIVISOR; divisor <= maxDivisor; divisor += 1) {
    for (let quotient = MIN_DIVISOR; quotient <= maxQuotient; quotient += 1) {
      pairs.push([divisor * quotient, divisor]);
    }
  }
  return pairs;
}

function getOneDigitExactOperands(level) {
  const pairs = [];
  const maxDivisor = Math.min(MAX_SINGLE_DIGIT, INITIAL_DIVISOR_LIMIT + level);
  for (let divisor = MIN_DIVISOR; divisor <= maxDivisor; divisor += 1) {
    for (let quotient = 1; quotient <= MAX_SINGLE_DIGIT; quotient += 1) {
      const dividend = divisor * quotient;
      if (dividend <= MAX_SINGLE_DIGIT) pairs.push([dividend, divisor]);
    }
  }
  return pairs;
}

function getTwoDigitExactOperands(level) {
  const pairs = [];
  const maxDivisor = Math.min(MAX_SINGLE_DIGIT, INITIAL_DIVISOR_LIMIT + level);
  const maxQuotient = Math.min(INITIAL_EXACT_QUOTIENT_LIMIT + level, MAX_SINGLE_DIGIT);
  for (let divisor = MIN_DIVISOR; divisor <= maxDivisor; divisor += 1) {
    for (let quotient = MIN_DIVISOR; quotient <= maxQuotient; quotient += 1) {
      const dividend = divisor * quotient;
      if (dividend >= MIN_TWO_DIGIT && dividend <= MAX_TWO_DIGIT) {
        pairs.push([dividend, divisor]);
      }
    }
  }
  return pairs;
}

function getRemainderOperands(courseType, level) {
  const pairs = [];
  const isSingleDigit = courseType === "one-digit-remainder";
  const maxDivisor = Math.min(MAX_SINGLE_DIGIT, INITIAL_DIVISOR_LIMIT + level);
  for (let divisor = MIN_DIVISOR; divisor <= maxDivisor; divisor += 1) {
    addRemainderPairs(pairs, divisor, isSingleDigit);
  }
  return pairs;
}

function addRemainderPairs(pairs, divisor, isSingleDigit) {
  for (let quotient = 1; quotient <= MAX_SINGLE_DIGIT; quotient += 1) {
    for (let remainder = 1; remainder < divisor; remainder += 1) {
      const dividend = divisor * quotient + remainder;
      const isValid = isSingleDigit
        ? dividend <= MAX_SINGLE_DIGIT
        : dividend >= MIN_TWO_DIGIT && dividend <= MAX_TWO_DIGIT;
      if (isValid) pairs.push([dividend, divisor, remainder]);
    }
  }
}

function getZeroOneOperands(level) {
  const pairs = [];
  for (let divisor = MIN_DIVISOR; divisor <= MAX_SINGLE_DIGIT; divisor += 1) {
    pairs.push([0, divisor]);
  }
  const maxDividend = MIN_TWO_DIGIT + level * MAX_SINGLE_DIGIT;
  for (let dividend = 1; dividend <= maxDividend; dividend += 1) {
    pairs.push([dividend, 1]);
  }
  return pairs;
}

function getMentalDivisionOperands(level) {
  const pairs = [];
  for (let divisor = MIN_DIVISOR; divisor <= MAX_SINGLE_DIGIT; divisor += 1) {
    const maxQuotient = Math.min(
      Math.floor(MAX_TWO_DIGIT / divisor),
      INITIAL_MENTAL_QUOTIENT_LIMIT + level * MENTAL_QUOTIENT_LEVEL_STEP,
    );
    addMentalDivisionPairs(pairs, divisor, maxQuotient);
  }
  return pairs;
}

function addMentalDivisionPairs(pairs, divisor, maxQuotient) {
  for (let quotient = MIN_MENTAL_QUOTIENT; quotient <= maxQuotient; quotient += 1) {
    for (let remainder = 0; remainder < divisor; remainder += 1) {
      const dividend = divisor * quotient + remainder;
      if (dividend <= MAX_TWO_DIGIT) pairs.push([dividend, divisor, remainder]);
    }
  }
}

function isStoryCourse(courseType) {
  return ["meaning", "exact-story", "remainder-story"].includes(courseType);
}

function chooseProblemOperands(items) {
  if (!quiz) return items[randomInteger(0, items.length - 1)];
  const seen = quiz.seen;
  const fresh = items.filter((item) => !seen.has(item.slice(0, 2).join("/")));
  const pool = fresh.length ? fresh : items;
  const keyOf = (item) => (item[0] === 0 ? "zero" : item[1] === 1 ? "one" : item[1]);
  const count = (item) => quiz.balance[keyOf(item)] || 0;
  const fewest = Math.min(...pool.map(count));
  const balanced = pool.filter((item) => count(item) === fewest);
  const picked = balanced[randomInteger(0, balanced.length - 1)];
  seen.add(picked.slice(0, 2).join("/"));
  quiz.balance[keyOf(picked)] = count(picked) + 1;
  return picked;
}

function makeDivisionProblem(dividend, divisor, remainder, text, unit) {
  const quotient = Math.floor(dividend / divisor);
  const answer = remainder ? `${quotient}あまり${remainder}` : String(quotient);
  const problemText = text === undefined ? `${dividend} ÷ ${divisor} =` : text;
  return {
    text: problemText,
    answer,
    unit: getProblemUnit(unit, remainder),
    hint: getProblemHint(remainder),
    explanation: createDivisionExplanation(
      dividend,
      divisor,
      quotient,
      remainder,
      answer,
    ),
  };
}

function getProblemUnit(unit, remainder) {
  if (!unit) return "";
  return remainder ? `${unit}（あまりも入力）` : unit;
}

function getProblemHint(remainder) {
  if (remainder) {
    return "わる数の九九で、わられる数をこえないいちばん大きな数を見つけよう。残りも考えてみよう。";
  }
  return "わる数を何倍すると、わられる数になるかな？";
}

function createDivisionExplanation(dividend, divisor, quotient, remainder, answer) {
  const product = divisor * quotient;
  if (!remainder) return `${divisor}×${quotient}=${dividend}。答えは${quotient}です。`;
  const multiplication = `${divisor}×${quotient}=${product}`;
  const remainderCalculation = `${dividend}-${product}=${remainder}`;
  return `${multiplication}、${remainderCalculation}。答えは${answer}です。`;
}

function makeStoryProblem(dividend, divisor, remainder, sharing) {
  const text = getStoryQuestion(dividend, divisor, remainder, sharing);
  const unit = sharing ? "こ" : "ふくろ";
  return makeDivisionProblem(dividend, divisor, remainder, text, unit);
}

function getStoryQuestion(dividend, divisor, remainder, sharing) {
  if (sharing) return getSharingQuestion(dividend, divisor, remainder);
  return getGroupingQuestion(dividend, divisor, remainder);
}

function getSharingQuestion(dividend, divisor, remainder) {
  const result = remainder ? "1人分は何こで、何こあまる？" : "1人分は何こ？";
  return `${dividend}このりんごを${divisor}人で同じ数ずつ分けると、${result}`;
}

function getGroupingQuestion(dividend, divisor, remainder) {
  const result = remainder ? "何ふくろできて、何こあまる？" : "何ふくろできる？";
  return `${dividend}このりんごを${divisor}こずつふくろに入れると、${result}`;
}

function setupQuiz(mode = "basic") {
  clearTimeout(advanceTimer);
  if (getElementById("feedback").open) getElementById("feedback").close();
  quiz = createQuiz(mode);
  locked = false;
  startModeTimer(mode);
  renderModeTitle(mode);
  showQuizScreen();
}

function createQuiz(mode) {
  const quizMode = typeof mode === "string" ? mode : "basic";
  return {
    mode: quizMode,
    index: 0,
    correct: 0,
    missed: false,
    failed: false,
    started: Date.now(),
    problems: [],
    seen: new Set(),
    balance: {},
  };
}

function startModeTimer(mode) {
  clearInterval(modeTimer);
  if (mode === "time") {
    modeTimer = setInterval(updateModeStatus, MODE_STATUS_REFRESH_MS);
  }
}

function renderModeTitle(mode) {
  const title = getElementById("modeTitle");
  const modeTitles = { time: "⏱ タイムアタック", chain: "🔥 連続正解" };
  title.classList.toggle("hidden", !modeTitles[mode]);
  title.textContent = modeTitles[mode] || "";
}

function showQuizScreen() {
  getElementById("home").classList.add("hidden");
  getElementById("result").classList.add("hidden");
  getElementById("quiz").classList.remove("hidden");
  requestAnimationFrame(resizeCanvases);
  nextProblem();
}

let modeTimer = null;
function updateModeStatus() {
  const status = getElementById("modeStatus");
  if (!quiz || quiz.mode === "basic") {
    status.classList.add("hidden");
    return;
  }
  status.classList.remove("hidden");
  if (quiz.mode === "time") {
    const elapsed = Math.floor((Date.now() - quiz.started) / MILLISECONDS_PER_SECOND);
    const minutes = Math.floor(elapsed / SECONDS_PER_MINUTE);
    const seconds = String(elapsed % SECONDS_PER_MINUTE).padStart(2, "0");
    status.textContent = `⏱ ${minutes}:${seconds}`;
  } else {
    status.textContent = `🔥 ${quiz.correct}問正解`;
  }
}

function nextProblem() {
  clearTimeout(advanceTimer);
  updateModeStatus();
  if (quiz.mode !== "chain" && quiz.index >= QUIZ_LENGTH) {
    finishQuiz();
    return;
  }

  const problem = makeProblem(quiz.index);
  quiz.problems[quiz.index] = problem;
  renderProblem(problem);
  clearWorkCanvas();
  resetAnswerInput();
}

function renderProblem(problem) {
  const course = courses.find((item) => item.id === selectedCourse);
  getElementById("problem").classList.toggle("story", isStoryCourse(course.type));
  getElementById("questionNo").textContent = quiz.mode === "chain"
    ? `${quiz.index + 1}問目`
    : `${quiz.index + 1} / ${QUIZ_LENGTH}`;
  getElementById("progress").style.width = quiz.mode === "chain"
    ? "100%"
    : `${(quiz.index / QUIZ_LENGTH) * 100}%`;
  getElementById("problem").textContent = problem.text;
  getElementById("unit").textContent = problem.unit;
  getElementById("unit").hidden = !problem.unit;
}

function resetAnswerInput() {
  getElementById("answer").value = "";
  getElementById("answer").disabled = false;
  getElementById("check").disabled = false;
  locked = false;
  getElementById("answer").focus();
}

function nextAfterFeedback() {
  if (quiz.mode === "chain" && quiz.failed) {
    closeFeedback();
    finishQuiz();
    return;
  }
  advanceQuiz();
}

function playFeedbackTone(isCorrect) {
  if (!soundEnabled) return;

  try {
    const context = getAudioContext();
    if (!context) return;
    playTone(context, isCorrect);
  } catch {
    // Audio is optional; answer checking remains available if the browser blocks it.
  }
}

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  audioContext ||= new AudioContextClass();
  if (audioContext.state === "suspended") void audioContext.resume();
  return audioContext;
}

function playTone(context, isCorrect) {
  const oscillator = context.createOscillator();
  const volume = context.createGain();
  const now = context.currentTime;
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(isCorrect ? 660 : 330, now);
  oscillator.frequency.setTargetAtTime(isCorrect ? 880 : 220, now + 0.06, 0.04);
  volume.gain.setValueAtTime(0.0001, now);
  volume.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
  volume.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  oscillator.connect(volume);
  volume.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.24);
}

function showFeedback(isCorrect, problem, submittedAnswer) {
  const dialog = getElementById("feedback");
  const content = getElementById("feedbackContent");
  const actions = getElementById("feedbackActions");
  content.replaceChildren();
  actions.replaceChildren();
  dialog.className = `feedback-dialog ${isCorrect ? "ok" : "no"}`;

  content.append(...createFeedbackMessage(isCorrect, problem));
  if (!isCorrect) recordWrongAnswer(problem, submittedAnswer);
  const primary = addFeedbackActions(actions, isCorrect, problem);
  dialog.showModal();
  primary.focus();
}

function createFeedbackMessage(isCorrect, problem) {
  const title = document.createElement("h2");
  title.id = "feedbackTitle";
  title.textContent = isCorrect ? "せいかい！ 🎉" : "おしい！";
  const message = document.createElement("p");
  message.textContent = isCorrect
    ? "すばらしい！この調子で進もう。"
    : `ヒント：${problem.hint}`;
  return [title, message];
}

function recordWrongAnswer(problem, submittedAnswer) {
  const entry = {
    grade: STUDENT_GRADE,
    courseId: selectedCourse,
    problem: problem.text,
    answer: submittedAnswer,
    correct: problem.answer,
    explain: problem.explanation,
  };
  const work = captureWork();
  if (work) entry.work = work;
  learningData.wrong.push(entry);
  learningData.wrong = learningData.wrong.slice(-MAX_WRONG_ENTRIES);
  saveLearningData();
}

function addFeedbackActions(actions, isCorrect, problem) {
  const primary = createPrimaryFeedbackAction(isCorrect);
  actions.append(primary);
  if (!isCorrect) actions.append(createRevealAnswerAction(problem));
  return primary;
}

function createPrimaryFeedbackAction(isCorrect) {
  const chainEnds = !isCorrect && quiz.mode === "chain";
  const action = document.createElement("button");
  action.type = "button";
  action.textContent = isCorrect ? "つぎへ ↵" : chainEnds ? "結果を見る ↵" : "もう一度 ↵";
  action.addEventListener(
    "click",
    isCorrect ? advanceQuiz : chainEnds ? nextAfterFeedback : retryQuestion,
  );
  return action;
}

function createRevealAnswerAction(problem) {
  const action = document.createElement("button");
  action.type = "button";
  action.className = "secondary";
  action.textContent = "答えを確認";
  action.addEventListener("click", () => revealAnswer(problem));
  return action;
}

function revealAnswer(problem) {
  const content = getElementById("feedbackContent");
  const actions = getElementById("feedbackActions");
  const title = content.querySelector("h2");
  renderRevealedAnswer(content, title, problem);
  const nextButton = createFeedbackNextButton();
  actions.replaceChildren(nextButton);
  nextButton.focus();
}

function renderRevealedAnswer(content, title, problem) {
  title.textContent = "答えを確認しよう";
  content.replaceChildren(title);
  const answer = document.createElement("p");
  answer.className = "feedback-answer";
  answer.textContent = `正解は「${problem.answer}」です。`;
  const explanation = document.createElement("p");
  explanation.textContent = problem.explanation;
  content.append(answer, explanation);
}

function createFeedbackNextButton() {
  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.textContent = quiz.mode === "chain" ? "結果を見る ↵" : "次へ ↵";
  nextButton.addEventListener("click", nextAfterFeedback);
  return nextButton;
}

function judgeAnswer() {
  if (locked || !quiz) return;
  const submittedAnswer = getElementById("answer").value.trim();
  if (!submittedAnswer) return;

  locked = true;
  getElementById("check").disabled = true;
  const problem = quiz.problems[quiz.index];
  const normalizedAnswer = submittedAnswer.replace(/\s/g, "");
  const isCorrect = problem.answer === normalizedAnswer;
  playFeedbackTone(isCorrect);
  showAnswerFeedback(isCorrect, problem, submittedAnswer);
}

function showAnswerFeedback(isCorrect, problem, submittedAnswer) {
  if (!isCorrect) {
    quiz.missed = true;
    quiz.failed = true;
    getElementById("answer").disabled = true;
    showFeedback(false, problem, submittedAnswer);
    return;
  }
  quiz.correct += 1;
  updateModeStatus();
  showFeedback(true, problem, submittedAnswer);
  advanceTimer = setTimeout(advanceQuiz, FEEDBACK_AUTO_ADVANCE_MS);
}

function closeFeedback() {
  clearTimeout(advanceTimer);
  if (getElementById("feedback").open) getElementById("feedback").close();
}

function advanceQuiz() {
  closeFeedback();
  quiz.index += 1;
  nextProblem();
}

function retryQuestion() {
  closeFeedback();
  locked = false;
  getElementById("answer").disabled = false;
  getElementById("answer").value = "";
  getElementById("check").disabled = false;
  getElementById("answer").focus();
}

function finishQuiz() {
  clearInterval(modeTimer);
  const stats = getCourseStats(selectedCourse);
  const elapsedSeconds = Math.round(
    (Date.now() - quiz.started) / MILLISECONDS_PER_SECOND,
  );
  updateCourseStats(stats, elapsedSeconds);
  learningData.stats[selectedCourse] = stats;
  saveLearningData();
  quiz.backToCourses = quiz.mode === "basic" && hasPassedCourse(stats);
  renderQuizResult(stats, elapsedSeconds);
}

function updateCourseStats(stats, elapsedSeconds) {
  if (quiz.mode === "basic") updateBasicStats(stats, elapsedSeconds);
  if (quiz.mode === "time") updateTimeAttackStats(stats, elapsedSeconds);
  if (quiz.mode === "chain") updateChainStats(stats);
}

function updateBasicStats(stats, elapsedSeconds) {
  stats.attempts += 1;
  if (isPerfectWithoutMistakes()) stats.streak += 1;
  else stats.streak = 0;
  if (isPerfectWithoutMistakes() && (!stats.best || elapsedSeconds < stats.best)) {
    stats.best = elapsedSeconds;
  }
}

function updateTimeAttackStats(stats, elapsedSeconds) {
  if (!quiz.missed && (!stats.timeBest || elapsedSeconds < stats.timeBest)) {
    stats.timeBest = elapsedSeconds;
  }
}

function updateChainStats(stats) {
  if (quiz.correct > (stats.chainBest || 0)) stats.chainBest = quiz.correct;
}

function isPerfectWithoutMistakes() {
  return quiz.correct === QUIZ_LENGTH && !quiz.missed;
}

function hasPassedCourse(stats) {
  return isPerfectWithoutMistakes() && stats.streak >= PASS_STREAK;
}

function renderQuizResult(stats, elapsedSeconds) {
  getElementById("quiz").classList.add("hidden");
  getElementById("result").classList.remove("hidden");
  const again = getElementById("again");
  if (quiz.mode === "basic") renderBasicResult(stats, again);
  if (quiz.mode === "time") renderTimeAttackResult(stats, again, elapsedSeconds);
  if (quiz.mode === "chain") renderChainResult(stats, again);
  updateResultChallenges(stats);
  renderStats();
  again.focus();
}

function renderBasicResult(stats, again) {
  const isPerfect = quiz.correct === QUIZ_LENGTH;
  getElementById("score").textContent = `${quiz.correct} / ${QUIZ_LENGTH} 問 正解`;
  again.textContent = quiz.backToCourses
    ? "コースに戻る ↵"
    : quiz.missed ? "もう一度挑戦する ↵" : "続けて挑戦する ↵";
  getElementById("resultTitle").textContent = isPerfect
    ? (quiz.missed ? "ぜんもん正解！" : "パーフェクト！")
    : "よくがんばったね！";
  getElementById("resultMessage").textContent = getBasicResultMessage(stats, isPerfect);
}

function getBasicResultMessage(stats, isPerfect) {
  if (!isPerfect) return "まちがいはノートに保存したよ。もう一度やってみよう。";
  if (quiz.missed) {
    return "再回答して全問正解！ただし途中でミスがあったので、合格ステップは0からだよ。";
  }
  const challengeMessage = stats.streak >= PASS_STREAK
    ? "チャレンジに挑戦できるよ！"
    : "あと少しで合格だよ！";
  return `ミスなし合格 ${stats.streak}/${PASS_STREAK}回。${challengeMessage}`;
}

function renderTimeAttackResult(stats, again, elapsedSeconds) {
  getElementById("score").textContent = `${elapsedSeconds} 秒`;
  again.textContent = "もう一度挑戦する ↵";
  getElementById("resultTitle").textContent = "⏱ タイムアタック";
  const missedMessage = quiz.missed ? "（ミスがあったので記録は更新されないよ）" : "";
  getElementById("resultMessage").textContent =
    `${QUIZ_LENGTH}問クリア！ベスト記録：${stats.timeBest ?? "-"}秒${missedMessage}`;
}

function renderChainResult(stats, again) {
  getElementById("score").textContent = `${quiz.correct} 問`;
  again.textContent = "もう一度挑戦する ↵";
  getElementById("resultTitle").textContent = "🔥 連続正解";
  getElementById("resultMessage").textContent = `最高記録：${stats.chainBest || 0}問`;
}

function updateResultChallenges(stats) {
  getElementById("chainBest").textContent = String(stats.chainBest || 0);
  const canChallenge = stats.streak >= PASS_STREAK;
  getElementById("timeAttack").disabled = !canChallenge;
  getElementById("chainAttack").disabled = !canChallenge;
  const challengeTitle = canChallenge
    ? "チャレンジに挑戦できます"
    : `あと${PASS_STREAK - stats.streak}回で解放`;
  ["timeAttack", "chainAttack"].forEach((id) => {
    getElementById(id).title = challengeTitle;
    getElementById(id).parentElement.title = challengeTitle;
  });
}

function buildKeypad() {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "あまり", "クリア"];
  const keypad = getElementById("keypad");
  keys.forEach((key) => keypad.append(createKeypadButton(key)));
}

function createKeypadButton(key) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = key;
  button.addEventListener("click", () => enterKeypadValue(key));
  return button;
}

function enterKeypadValue(key) {
  const answer = getElementById("answer");
  if (answer.disabled) return;
  if (key === "⌫") answer.value = answer.value.slice(0, -1);
  else if (key === "クリア") answer.value = "";
  else if (key === "あまり") {
    if (!answer.value.includes("あまり")) answer.value += "あまり";
  } else answer.value += key;
  answer.focus();
}

function setupCanvas(id) {
  const canvas = getElementById(id);
  const context = canvas.getContext("2d");
  const drawingState = { isDrawing: false, hasInk: false };
  const resize = () => resizeCanvas(canvas, context);
  resize();
  canvasResizers.push(resize);
  registerCanvasEvents(canvas, context, drawingState);
  return {
    clear: () => clearCanvas(canvas, context, drawingState),
    snapshot: () => createCanvasSnapshot(canvas, drawingState.hasInk),
  };
}

function registerCanvasEvents(canvas, context, drawingState) {
  canvas.addEventListener("pointerdown", (event) => {
    startCanvasStroke(canvas, context, drawingState, event);
  });
  canvas.addEventListener("pointermove", (event) => {
    continueCanvasStroke(context, drawingState, event);
  });
  canvas.addEventListener("pointerup", () => stopCanvasStroke(drawingState));
  canvas.addEventListener("pointercancel", () => stopCanvasStroke(drawingState));
}

function resizeCanvas(canvas, context) {
  const bounds = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = bounds.width * scale;
  canvas.height = bounds.height * scale;
  context.setTransform(scale, 0, 0, scale, 0, 0);
  context.lineWidth = CANVAS_BRUSH_WIDTH;
  context.lineCap = "round";
  context.strokeStyle = "#53795d";
}

function startCanvasStroke(canvas, context, state, event) {
  state.isDrawing = true;
  canvas.setPointerCapture(event.pointerId);
  context.beginPath();
  context.moveTo(event.offsetX, event.offsetY);
}

function continueCanvasStroke(context, state, event) {
  if (!state.isDrawing) return;
  context.lineTo(event.offsetX, event.offsetY);
  context.stroke();
  state.hasInk = true;
}

function stopCanvasStroke(state) {
  state.isDrawing = false;
}

function clearCanvas(canvas, context, state) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  state.hasInk = false;
}

function createCanvasSnapshot(canvas, hasInk) {
  if (!hasInk || !canvas.width || !canvas.height) return "";
  const width = Math.min(MAX_CANVAS_SNAPSHOT_WIDTH, canvas.width);
  const snapshot = document.createElement("canvas");
  snapshot.width = width;
  snapshot.height = Math.max(1, Math.round((canvas.height * width) / canvas.width));
  const context = snapshot.getContext("2d");
  context.fillStyle = "#fff";
  context.fillRect(0, 0, snapshot.width, snapshot.height);
  context.drawImage(canvas, 0, 0, snapshot.width, snapshot.height);
  return snapshot.toDataURL("image/png");
}

function returnToCourses() {
  clearInterval(modeTimer);
  getElementById("quiz").classList.add("hidden");
  getElementById("result").classList.add("hidden");
  getElementById("home").classList.remove("hidden");
  renderStats();
}

function initializeApplication() {
  renderCourses();
  renderStats();
  buildKeypad();
  initializeWorkCanvas();
  registerEventHandlers();
  updateSoundControl();
}

function initializeWorkCanvas() {
  workCanvas = setupCanvas("noteCanvas");
  window.addEventListener("resize", resizeCanvases);
  document.querySelectorAll(".clear").forEach((button) => {
    button.addEventListener("click", clearWorkCanvas);
  });
}

function clearWorkCanvas() {
  workCanvas?.clear();
}

function captureWork() {
  return workCanvas?.snapshot() || "";
}

function registerEventHandlers() {
  registerAnswerHandlers();
  registerKeyboardHandlers();
  registerQuizControls();
  registerReviewControls();
  registerDataControls();
  registerSoundControl();
}

function registerAnswerHandlers() {
  getElementById("check").addEventListener("click", judgeAnswer);
  getElementById("answer").addEventListener("keydown", handleAnswerKeydown);
}

function handleAnswerKeydown(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  event.stopPropagation();
  judgeAnswer();
}

function registerKeyboardHandlers() {
  document.addEventListener("keydown", advanceFeedbackOnEnter);
  document.addEventListener("keydown", moveButtonFocus);
  getElementById("feedback").addEventListener("cancel", (event) => event.preventDefault());
}

function advanceFeedbackOnEnter(event) {
  const isEnterKey = event.key === "Enter";
  const feedbackIsOpen = getElementById("feedback").open;
  const answerHasFocus = event.target === getElementById("answer");
  if (!isEnterKey || !feedbackIsOpen || answerHasFocus) return;
  event.preventDefault();
  getElementById("feedbackActions").querySelector("button")?.click();
}

function moveButtonFocus(event) {
  const keyDirections = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 };
  const direction = keyDirections[event.key];
  const currentButton = event.target;
  if (!direction || !(currentButton instanceof HTMLButtonElement)) return;

  const scope = currentButton.closest(
    "dialog, #coursesPanel, #reviewPanel, #result, .quiz-response",
  );
  if (!scope) return;
  focusAdjacentButton(event, scope, currentButton, direction);
}

function focusAdjacentButton(event, scope, currentButton, direction) {
  const buttons = [...scope.querySelectorAll("button:not(:disabled)")];
  const visibleButtons = buttons.filter((button) => button.offsetParent !== null);
  const currentIndex = visibleButtons.indexOf(currentButton);
  if (currentIndex < 0 || visibleButtons.length < 2) return;
  event.preventDefault();
  const nextIndex = (currentIndex + direction + visibleButtons.length) % visibleButtons.length;
  visibleButtons[nextIndex].focus();
}

function registerQuizControls() {
  getElementById("quit").addEventListener("click", confirmQuitQuiz);
  getElementById("again").addEventListener("click", restartQuiz);
  getElementById("timeAttack").addEventListener("click", () => setupQuiz("time"));
  getElementById("chainAttack").addEventListener("click", () => setupQuiz("chain"));
  getElementById("homeButton").addEventListener("click", returnToCoursesFromLink);
}

function confirmQuitQuiz() {
  if (confirm("挑戦を中断してコース選択へ戻りますか？")) returnToCourses();
}

function restartQuiz() {
  if (quiz?.backToCourses) returnToCourses();
  else setupQuiz(quiz?.mode);
}

function returnToCoursesFromLink(event) {
  event.preventDefault();
  returnToCourses();
}

function registerReviewControls() {
  getElementById("reviewBack").addEventListener("click", returnToCourseList);
}

function returnToCourseList() {
  getElementById("reviewPanel").classList.add("hidden");
  getElementById("coursesPanel").classList.remove("hidden");
}

function registerDataControls() {
  getElementById("resetData").addEventListener("click", resetLearningData);
}

function resetLearningData() {
  if (!confirm("学習記録、進捗、復習ノートを初期化します。よろしいですか？")) return;
  clearTimeout(advanceTimer);
  clearInterval(modeTimer);
  closeFeedback();
  localStorage.removeItem(STORAGE_KEY);
  resetApplicationState();
  showCourseSelection();
}

function resetApplicationState() {
  learningData = defaultData();
  selectedCourse = learningData.course;
  quiz = null;
  locked = false;
}

function showCourseSelection() {
  getElementById("quiz").classList.add("hidden");
  getElementById("result").classList.add("hidden");
  getElementById("home").classList.remove("hidden");
  renderCourses();
  renderStats();
  getElementById("courses").querySelector(".course-start")?.focus();
}

function updateSoundControl() {
  getElementById("sound").setAttribute("aria-pressed", String(soundEnabled));
  getElementById("sound").setAttribute("aria-label", soundEnabled ? "音あり" : "消音");
  getElementById("sound").title = soundEnabled ? "音あり" : "消音";
  getElementById("sound").textContent = soundEnabled ? "🔊" : "🔇";
}

function registerSoundControl() {
  getElementById("sound").addEventListener("click", toggleSound);
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem(SOUND_KEY, String(soundEnabled));
  updateSoundControl();
}

initializeApplication();

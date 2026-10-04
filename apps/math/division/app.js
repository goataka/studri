"use strict";

const STORAGE_KEY = "studri-division-v1";
const SOUND_KEY = `${STORAGE_KEY}-sound`;
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
  { id: "g3-meaning-story", emoji: "📖", name: "文章題（割り算の意味）", desc: "分ける・いくつ分の場面を考えよう", type: "meaning" },
  { id: "g3-one-digit-exact", emoji: "🔢", name: "1桁 ÷ 1桁（九九の範囲・あまりなし）", desc: "九九を使って、ぴったり分けよう", type: "one-digit-exact" },
  { id: "g3-two-digit-exact", emoji: "🔢", name: "2桁 ÷ 1桁（九九の範囲・あまりなし）", desc: "2桁の数を九九でぴったり分けよう", type: "two-digit-exact" },
  { id: "g3-exact-story", emoji: "📖", name: "文章題（九九の範囲・あまりなし）", desc: "文章題を読んで、ぴったり分けよう", type: "exact-story" },
  { id: "g3-one-digit-remainder", emoji: "🔢", name: "1桁 ÷ 1桁（九九の範囲・あまりあり）", desc: "1桁のわり算で、商とあまりを答えよう", type: "one-digit-remainder" },
  { id: "g3-two-digit-remainder", emoji: "🔢", name: "2桁 ÷ 1桁（九九の範囲・あまりあり）", desc: "九九を使って、商とあまりを見つけよう", type: "two-digit-remainder" },
  { id: "g3-remainder-story", emoji: "📖", name: "文章題（九九の範囲・あまりあり）", desc: "文章題で、商とあまりを考えよう", type: "remainder-story" },
  { id: "g3-zero-one", emoji: "🔢", name: "０や１のわり算", desc: "0をわる計算や、1でわる計算に挑戦", type: "zero-one" },
  { id: "g3-two-digit-mental", emoji: "🔢", name: "2桁 ÷ 1桁（九九を超える暗算）", desc: "商が10以上になる計算を暗算しよう", type: "two-digit-mental" },
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
      ? saved.wrong.filter((entry) => entry && entry.grade === 3).slice(-30)
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

let data = loadData();
let selectedCourse = data.course;
let quiz = null;
let locked = false;
let advanceTimer = null;
let soundEnabled = localStorage.getItem(SOUND_KEY) !== "false";
let audioContext = null;
const canvasResizers = [];

const get = (id) => document.getElementById(id);
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
const resizeCanvases = () => canvasResizers.forEach((resize) => resize());

function renderCourses() {
  const courseList = get("courses");
  courseList.replaceChildren();

  courses.forEach((course) => {
    const card = document.createElement("article");
    card.className = `course${selectedCourse === course.id ? " selected" : ""}`;
    card.dataset.course = course.id;

    const start = document.createElement("button");
    start.type = "button";
    start.className = "course-start";
    const copy = document.createElement("span");
    copy.className = "course-copy";
    const name = document.createElement("strong");
    const courseIcon = document.createElement("span");
    courseIcon.className = "course-icon";
    courseIcon.setAttribute("aria-hidden", "true");
    courseIcon.textContent = course.emoji;
    name.append(courseIcon, document.createTextNode(` ${course.name}`));
    const description = document.createElement("small");
    description.textContent = course.desc;
    copy.append(name, description);

    const details = document.createElement("span");
    details.className = "course-details";
    const progress = document.createElement("span");
    progress.className = "course-progress";
    const basicGroup = document.createElement("span");
    basicGroup.className = "course-group";
    const basicLabel = document.createElement("span");
    basicLabel.className = "course-group-label";
    const basicIcon = document.createElement("span");
    basicIcon.className = "course-group-icon";
    basicIcon.setAttribute("aria-hidden", "true");
    basicIcon.textContent = "🌱";
    basicLabel.append(basicIcon, document.createTextNode(" ベーシック"));
    const steps = document.createElement("span");
    steps.className = "course-steps";
    steps.setAttribute("aria-hidden", "true");
    for (let step = 0; step < 4; step += 1) {
      const indicator = document.createElement("span");
      indicator.className = step === 0 ? "course-step start-dot" : step === 3 ? "course-step final" : "course-step";
      indicator.textContent = ["", "🥇", "🥈", "🥉"][step];
      steps.append(indicator);
    }
    basicGroup.append(basicLabel, steps);
    progress.append(basicGroup);
    const challengeGroup = document.createElement("div");
    challengeGroup.className = "course-challenge-group";
    const challengeLabel = document.createElement("span");
    challengeLabel.className = "course-group-label";
    const challengeGroupIcon = document.createElement("span");
    challengeGroupIcon.className = "course-group-icon";
    challengeGroupIcon.setAttribute("aria-hidden", "true");
    challengeGroupIcon.textContent = "🌳";
    challengeLabel.append(challengeGroupIcon, document.createTextNode(" チャレンジ"));
    const challenges = document.createElement("div");
    challenges.className = "course-challenges";
    challenges.setAttribute("aria-label", "合格後のチャレンジ");
    [
      ["⏱", "タイムアタック", "time"],
      ["🔥", "連続正解", "chain"],
    ].forEach(([emoji, label, mode]) => {
      const control = document.createElement("span");
      control.className = "course-challenge-control";
      const challenge = document.createElement("button");
      challenge.type = "button";
      challenge.className = "course-challenge";
      challenge.dataset.mode = mode;
      const icon = document.createElement("span");
      icon.className = "course-challenge-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = emoji;
      const text = document.createElement("span");
      text.textContent = ` ${label}`;
      challenge.append(icon, text);
      control.append(challenge);
      challenges.append(control);
    });

    details.append(progress);
    start.append(copy, details);
    const side = document.createElement("div");
    side.className = "course-side";
    challengeGroup.append(challengeLabel, challenges);
    side.append(challengeGroup);
    const toolsGroup = document.createElement("div");
    toolsGroup.className = "course-tools-group";
    const toolsLabel = document.createElement("span");
    toolsLabel.className = "course-group-label";
    toolsLabel.textContent = "🧰 ツール";
    const log = document.createElement("button");
    log.type = "button";
    log.className = "course-log";
    log.dataset.reviewCourse = course.id;
    log.setAttribute("aria-label", `📜 ログ：${course.name}`);
    log.addEventListener("click", () => showCourseLog(course));
    toolsGroup.append(toolsLabel, log);
    card.append(start, side, toolsGroup);
    start.addEventListener("click", () => {
      selectedCourse = course.id;
      data.course = selectedCourse;
      save();
      renderCourses();
      renderStats();
      setupQuiz();
    });
    courseList.append(card);
  });
  const begin = document.createElement("div");
  begin.className = "course-begin";
  const beginCopy = document.createElement("span");
  beginCopy.className = "course-copy";
  const beginLabel = document.createElement("strong");
  const beginIcon = document.createElement("span");
  beginIcon.className = "course-icon";
  beginIcon.setAttribute("aria-hidden", "true");
  beginIcon.textContent = "🧭";
  beginLabel.append(beginIcon, document.createTextNode(" スタート"));
  const beginMessage = document.createElement("small");
  beginMessage.textContent = "ベーシックを3つ進めよう！チャレンジできるようになるよ♪間違えたらログから確認してみてね。";
  beginCopy.append(beginLabel, beginMessage);
  begin.append(beginCopy);
  courseList.prepend(begin);
  const goal = document.createElement("div");
  goal.className = "course-goal";
  const goalCopy = document.createElement("span");
  goalCopy.className = "course-copy";
  const goalLabel = document.createElement("strong");
  const goalIcon = document.createElement("span");
  goalIcon.className = "course-icon";
  goalIcon.setAttribute("aria-hidden", "true");
  goalIcon.textContent = "🚩";
  goalLabel.append(goalIcon, document.createTextNode(" ゴール"));
  const goalMessage = document.createElement("small");
  goalMessage.textContent = "おめでとう！たくさん頑張ったね♪次にも挑戦してみてね。";
  goalCopy.append(goalLabel, goalMessage);
  goal.append(goalCopy);
  courseList.append(goal);
  renderCourseProgress();
}

function renderCourseProgress() {
  courses.forEach((course) => {
    const button = get("courses").querySelector(`[data-course="${course.id}"]`);
    if (!button) return;

    const stats = data.stats[course.id] || { streak: 0, attempts: 0, best: null };
    const streak = Math.min(stats.streak, 3);
    let pin = button.querySelector(".course-pass-pin");
    if (stats.streak > 0 && !pin) {
      pin = document.createElement("span");
      pin.className = "course-pass-pin";
      pin.textContent = "📍";
      pin.setAttribute("aria-label", "ベーシック合格");
      button.prepend(pin);
    } else if (stats.streak === 0) {
      pin?.remove();
    }
    const challengeGroup = button.querySelector(".course-challenge-group");
    challengeGroup.classList.toggle("is-next", streak >= 3);
    button.querySelectorAll(".course-step").forEach((step, index) => {
      step.classList.toggle("current", index === (streak === 0 ? 0 : streak + 1) && streak < 3);
      step.classList.toggle("complete", (index === 0 && streak > 0) || (index > 0 && index <= streak));
    });
    button.querySelectorAll(".course-challenge").forEach((challenge) => {
      challenge.disabled = stats.streak < 3;
      challenge.setAttribute("aria-label", challenge.textContent);
      const control = challenge.parentElement;
      if (stats.streak < 3) control.title = `あと${3 - streak}回で解放`;
      else control.removeAttribute("title");
    });
    const log = button.querySelector(".course-log");
    const mistakeCount = data.wrong.filter((entry) => entry.courseId === course.id).length;
    log.replaceChildren(document.createTextNode("📜 ログ"));
    log.disabled = mistakeCount === 0;
    log.title = mistakeCount === 0 ? "このコースの誤答ログはありません" : `${mistakeCount}件の誤答ログ`;
    if (mistakeCount) {
      const count = document.createElement("span");
      count.className = "course-log-count";
      count.textContent = String(mistakeCount);
      log.append(count);
    }
    button.querySelector(".course-start").setAttribute(
      "aria-label",
      `小学3年生、${course.name}。${course.desc}。合格ステップ ${streak}回。`,
    );
  });
}

function renderStats() {
  renderCourseProgress();
}

function showCourseLog(course) {
  get("coursesPanel").classList.add("hidden");
  get("reviewPanel").classList.remove("hidden");
  get("reviewTitle").textContent = `📜 ログ：${course.name}`;
  const reviewList = get("reviewList");
  reviewList.replaceChildren();
  const courseMistakes = data.wrong.filter((entry) => entry.courseId === course.id);
  if (courseMistakes.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "このコースのまちがいはまだありません。挑戦してみよう！";
    reviewList.append(emptyMessage);
    return;
  }

  courseMistakes.slice(-8).reverse().forEach((entry) => {
    const item = document.createElement("div");
    item.className = "review-item";
    const problem = document.createElement("b");
    problem.textContent = entry.problem;
    const answer = document.createElement("div");
    answer.textContent = `あなたの答え：${entry.answer || "未入力"} / 正解：${entry.correct}`;
    const explanation = document.createElement("small");
    explanation.textContent = entry.explain;
    item.append(problem, answer, explanation);
    reviewList.append(item);
  });
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeProblem(index) {
  const course = courses.find((item) => item.id === selectedCourse);
  const level = Math.min(index, 9);
  let dividend;
  let divisor;
  let remainder = 0;

  switch (course.type) {
    case "meaning": {
      divisor = randomInteger(2, Math.min(5, 2 + Math.floor(level / 2)));
      const quotient = randomInteger(2, Math.min(9, 3 + level));
      dividend = divisor * quotient;
      return makeStoryProblem(dividend, divisor, 0, Math.random() < 0.5);
    }
    case "one-digit-exact": {
      const pairs = [];
      for (let candidateDivisor = 2; candidateDivisor <= Math.min(9, 3 + level); candidateDivisor += 1) {
        for (let quotient = 1; quotient <= 9; quotient += 1) {
          if (candidateDivisor * quotient <= 9) pairs.push([candidateDivisor * quotient, candidateDivisor]);
        }
      }
      [dividend, divisor] = choose(pairs);
      break;
    }
    case "two-digit-exact":
    case "exact-story": {
      const pairs = [];
      for (let candidateDivisor = 2; candidateDivisor <= Math.min(9, 3 + level); candidateDivisor += 1) {
        for (let quotient = 2; quotient <= Math.min(9, 4 + level); quotient += 1) {
          const product = candidateDivisor * quotient;
          if (product >= 10 && product <= 99) pairs.push([product, candidateDivisor]);
        }
      }
      [dividend, divisor] = choose(pairs);
      if (course.type === "exact-story") return makeStoryProblem(dividend, divisor, 0, Math.random() < 0.5);
      break;
    }
    case "one-digit-remainder":
    case "two-digit-remainder":
    case "remainder-story": {
      const singleDigit = course.type === "one-digit-remainder";
      const pairs = [];
      for (let candidateDivisor = 2; candidateDivisor <= Math.min(9, 3 + level); candidateDivisor += 1) {
        for (let quotient = 1; quotient <= 9; quotient += 1) {
          for (let candidateRemainder = 1; candidateRemainder < candidateDivisor; candidateRemainder += 1) {
            const number = candidateDivisor * quotient + candidateRemainder;
            if ((singleDigit && number <= 9) || (!singleDigit && number >= 10 && number <= 99)) {
              pairs.push([number, candidateDivisor, candidateRemainder]);
            }
          }
        }
      }
      [dividend, divisor, remainder] = choose(pairs);
      if (course.type === "remainder-story") return makeStoryProblem(dividend, divisor, remainder, Math.random() < 0.5);
      break;
    }
    case "zero-one":
      if (Math.random() < 0.5) {
        dividend = 0;
        divisor = randomInteger(2, 9);
      } else {
        dividend = randomInteger(0, 10 + level * 9);
        divisor = 1;
      }
      break;
    case "two-digit-mental": {
      const pairs = [];
      for (let candidateDivisor = 2; candidateDivisor <= 9; candidateDivisor += 1) {
        for (let quotient = 10; quotient <= Math.min(Math.floor(99 / candidateDivisor), 12 + level * 2); quotient += 1) {
          for (let candidateRemainder = 0; candidateRemainder < candidateDivisor; candidateRemainder += 1) {
            const number = candidateDivisor * quotient + candidateRemainder;
            if (number <= 99) pairs.push([number, candidateDivisor, candidateRemainder]);
          }
        }
      }
      [dividend, divisor, remainder] = choose(pairs);
      break;
    }
    default:
      throw new Error(`Unknown division course type: ${course.type}`);
  }

  return makeDivisionProblem(dividend, divisor, remainder);
}

function choose(items) {
  return items[randomInteger(0, items.length - 1)];
}

function makeDivisionProblem(dividend, divisor, remainder, text = `${dividend} ÷ ${divisor} =`) {
  const quotient = Math.floor(dividend / divisor);
  const answer = remainder ? `${quotient}あまり${remainder}` : String(quotient);
  const explanation = remainder
    ? `${divisor}×${quotient}=${divisor * quotient}、${dividend}-${divisor * quotient}=${remainder}。答えは${answer}です。`
    : `${divisor}×${quotient}=${dividend}。答えは${quotient}です。`;

  return {
    text,
    answer,
    unit: remainder ? "こ（あまりも入力）" : "こ",
    hint: remainder
      ? "わる数の九九で、わられる数をこえないいちばん大きな数を見つけよう。残りも考えてみよう。"
      : "わる数を何倍すると、わられる数になるかな？",
    explanation,
  };
}

function makeStoryProblem(dividend, divisor, remainder, sharing) {
  const text = sharing
    ? remainder
      ? `${dividend}このりんごを${divisor}人で同じ数ずつ分けると、1人分は何こで、何こあまる？`
      : `${dividend}このりんごを${divisor}人で同じ数ずつ分けると、1人分は何こ？`
    : remainder
      ? `${dividend}このりんごを${divisor}こずつふくろに入れると、何ふくろできて、何こあまる？`
      : `${dividend}このりんごを${divisor}こずつふくろに入れると、何ふくろできる？`;
  return makeDivisionProblem(dividend, divisor, remainder, text);
}

function setupQuiz() {
  clearTimeout(advanceTimer);
  if (get("feedback").open) get("feedback").close();
  quiz = { index: 0, correct: 0, missed: false, started: Date.now(), problems: [] };
  locked = false;
  get("home").classList.add("hidden");
  get("result").classList.add("hidden");
  get("quiz").classList.remove("hidden");
  requestAnimationFrame(resizeCanvases);
  nextProblem();
}

function nextProblem() {
  clearTimeout(advanceTimer);
  if (quiz.index >= 10) {
    finishQuiz();
    return;
  }

  const problem = makeProblem(quiz.index);
  quiz.problems[quiz.index] = problem;
  get("questionNo").textContent = `${quiz.index + 1} / 10`;
  get("progress").style.width = `${quiz.index * 10}%`;
  get("difficulty").textContent = quiz.index < 3
    ? "LEVEL 1・じゅんび"
    : quiz.index < 7
      ? "LEVEL 2・ステップアップ"
      : "LEVEL 3・チャレンジ";
  get("problem").textContent = problem.text;
  get("unit").textContent = problem.unit;
  get("answer").value = "";
  get("answer").disabled = false;
  get("check").disabled = false;
  locked = false;
  get("answer").focus();
}

function playFeedbackTone(isCorrect) {
  if (!soundEnabled) return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioContext ||= new AudioContextClass();
    if (audioContext.state === "suspended") void audioContext.resume();

    const oscillator = audioContext.createOscillator();
    const volume = audioContext.createGain();
    const now = audioContext.currentTime;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(isCorrect ? 660 : 330, now);
    oscillator.frequency.setTargetAtTime(isCorrect ? 880 : 220, now + 0.06, 0.04);
    volume.gain.setValueAtTime(0.0001, now);
    volume.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
    volume.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    oscillator.connect(volume);
    volume.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.24);
  } catch {
    // Audio is an optional enhancement; keep answer checking available if the browser blocks it.
  }
}

function showFeedback(isCorrect, problem, rawAnswer) {
  const dialog = get("feedback");
  const content = get("feedbackContent");
  const actions = get("feedbackActions");
  content.replaceChildren();
  actions.replaceChildren();
  dialog.className = `feedback-dialog ${isCorrect ? "ok" : "no"}`;

  const title = document.createElement("h2");
  title.id = "feedbackTitle";
  title.textContent = isCorrect ? "せいかい！ 🎉" : "おしい！";
  const message = document.createElement("p");
  message.textContent = isCorrect
    ? "すばらしい！この調子で進もう。"
    : `ヒント：${problem.hint}`;
  content.append(title, message);

  if (!isCorrect) {
    data.wrong.push({
      grade: 3,
      courseId: selectedCourse,
      problem: problem.text,
      answer: rawAnswer,
      correct: problem.answer,
      explain: problem.explanation,
    });
    data.wrong = data.wrong.slice(-30);
    save();
  }

  const primary = document.createElement("button");
  primary.type = "button";
  primary.textContent = isCorrect ? "つぎへ（Enter）" : "もう一度（Enter）";
  primary.addEventListener("click", isCorrect ? advanceQuiz : retryQuestion);
  actions.append(primary);

  if (!isCorrect) {
    const confirmAnswer = document.createElement("button");
    confirmAnswer.type = "button";
    confirmAnswer.className = "secondary";
    confirmAnswer.textContent = "答えを確認";
    confirmAnswer.addEventListener("click", () => revealAnswer(problem));
    actions.append(confirmAnswer);
  }

  dialog.showModal();
  primary.focus();
}

function revealAnswer(problem) {
  const content = get("feedbackContent");
  const actions = get("feedbackActions");
  const title = content.querySelector("h2");
  title.textContent = "答えを確認しよう";
  content.replaceChildren(title);

  const answer = document.createElement("p");
  answer.className = "feedback-answer";
  answer.textContent = `正解は「${problem.answer}」です。`;
  const explanation = document.createElement("p");
  explanation.textContent = problem.explanation;
  content.append(answer, explanation);

  actions.replaceChildren();
  const next = document.createElement("button");
  next.type = "button";
  next.textContent = "次へ";
  next.addEventListener("click", advanceQuiz);
  actions.append(next);
  next.focus();
}

function judgeAnswer() {
  if (locked || !quiz) return;
  const rawAnswer = get("answer").value.trim();
  if (!rawAnswer) return;

  locked = true;
  get("check").disabled = true;
  const problem = quiz.problems[quiz.index];
  const normalizedAnswer = rawAnswer.replace(/\s/g, "");
  const isCorrect = problem.answer === normalizedAnswer;
  playFeedbackTone(isCorrect);

  if (isCorrect) {
    quiz.correct += 1;
    showFeedback(true, problem, rawAnswer);
    advanceTimer = setTimeout(advanceQuiz, 3000);
    return;
  }

  quiz.missed = true;
  get("answer").disabled = true;
  showFeedback(false, problem, rawAnswer);
}

function closeFeedback() {
  clearTimeout(advanceTimer);
  if (get("feedback").open) get("feedback").close();
}

function advanceQuiz() {
  closeFeedback();
  quiz.index += 1;
  nextProblem();
}

function retryQuestion() {
  closeFeedback();
  locked = false;
  get("answer").disabled = false;
  get("answer").value = "";
  get("check").disabled = false;
  get("answer").focus();
}

function finishQuiz() {
  const stats = data.stats[selectedCourse] || { streak: 0, attempts: 0, best: null };
  stats.attempts += 1;
  if (quiz.correct === 10 && !quiz.missed) stats.streak += 1;
  else stats.streak = 0;

  const seconds = Math.round((Date.now() - quiz.started) / 1000);
  if (quiz.correct === 10 && !quiz.missed && (!stats.best || seconds < stats.best)) {
    stats.best = seconds;
  }
  data.stats[selectedCourse] = stats;
  save();

  get("quiz").classList.add("hidden");
  get("result").classList.remove("hidden");
  get("score").textContent = `${quiz.correct} / 10 問 正解`;
  get("again").textContent = quiz.missed ? "もう一度挑戦する" : "続けて挑戦する";
  get("resultTitle").textContent = quiz.correct === 10
    ? (quiz.missed ? "ぜんもん正解！" : "パーフェクト！")
    : "よくがんばったね！";
  get("resultMessage").textContent = quiz.correct === 10
    ? (quiz.missed
      ? "再回答して全問正解！ただし途中でミスがあったので、合格ステップは0からだよ。"
      : `ミスなし合格 ${stats.streak}/3回。${stats.streak >= 3 ? "チャレンジに挑戦できるよ！" : "あと少しで合格だよ！"}`)
    : "まちがいはノートに保存したよ。もう一度やってみよう。";
  get("chainBest").textContent = localStorage.getItem(`${STORAGE_KEY}-chain`) || "0";
  get("timeAttack").disabled = stats.streak < 3;
  get("chainAttack").disabled = stats.streak < 3;
  const challengeTitle = stats.streak >= 3
    ? "チャレンジに挑戦できます"
    : `あと${3 - stats.streak}回で解放`;
  ["timeAttack", "chainAttack"].forEach((id) => {
    get(id).title = challengeTitle;
    get(id).parentElement.title = challengeTitle;
  });
  renderStats();
  get("again").focus();
}

function buildKeypad() {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "あまり", "クリア"];
  const keypad = get("keypad");
  keys.forEach((key) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = key;
    button.addEventListener("click", () => {
      const answer = get("answer");
      if (answer.disabled) return;
      if (key === "⌫") answer.value = answer.value.slice(0, -1);
      else if (key === "クリア") answer.value = "";
      else if (key === "あまり") {
        if (!answer.value.includes("あまり")) answer.value += "あまり";
      } else answer.value += key;
      answer.focus();
    });
    keypad.append(button);
  });
}

function setupCanvas(id) {
  const canvas = get(id);
  const context = canvas.getContext("2d");
  let drawing = false;

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    canvas.width = bounds.width * scale;
    canvas.height = bounds.height * scale;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.lineWidth = 3;
    context.lineCap = "round";
    context.strokeStyle = "#53795d";
  }

  resize();
  canvasResizers.push(resize);
  canvas.addEventListener("pointerdown", (event) => {
    drawing = true;
    canvas.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(event.offsetX, event.offsetY);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!drawing) return;
    context.lineTo(event.offsetX, event.offsetY);
    context.stroke();
  });
  canvas.addEventListener("pointerup", () => {
    drawing = false;
  });
  canvas.addEventListener("pointercancel", () => {
    drawing = false;
  });

  return () => context.clearRect(0, 0, canvas.width, canvas.height);
}

function returnToCourses() {
  get("quiz").classList.add("hidden");
  get("result").classList.add("hidden");
  get("home").classList.remove("hidden");
  renderStats();
}

renderCourses();
renderStats();
buildKeypad();
const clearWorkCanvas = setupCanvas("noteCanvas");
window.addEventListener("resize", resizeCanvases);

get("check").addEventListener("click", judgeAnswer);
get("answer").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    event.stopPropagation();
    judgeAnswer();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || !get("feedback").open || event.target === get("answer")) return;
  event.preventDefault();
  get("feedbackActions").querySelector("button")?.click();
});
get("feedback").addEventListener("cancel", (event) => event.preventDefault());
get("quit").addEventListener("click", () => {
  if (confirm("挑戦を中断してコース選択へ戻りますか？")) returnToCourses();
});
get("again").addEventListener("click", setupQuiz);
get("reviewBack").addEventListener("click", () => {
  get("reviewPanel").classList.add("hidden");
  get("coursesPanel").classList.remove("hidden");
});
get("homeButton").addEventListener("click", (event) => {
  event.preventDefault();
  returnToCourses();
});
function updateSoundControl() {
  get("sound").setAttribute("aria-pressed", String(soundEnabled));
  get("sound").setAttribute("aria-label", soundEnabled ? "音あり" : "消音");
  get("sound").title = soundEnabled ? "音あり" : "消音";
  get("sound").textContent = soundEnabled ? "🔊" : "🔇";
}

updateSoundControl();
get("sound").addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  localStorage.setItem(SOUND_KEY, String(soundEnabled));
  updateSoundControl();
});
get("resetData").addEventListener("click", () => {
  if (!confirm("学習記録、進捗、復習ノートを初期化します。よろしいですか？")) return;
  clearTimeout(advanceTimer);
  if (get("feedback").open) get("feedback").close();
  localStorage.removeItem(STORAGE_KEY);
  data = defaultData();
  selectedCourse = data.course;
  quiz = null;
  locked = false;
  get("quiz").classList.add("hidden");
  get("result").classList.add("hidden");
  get("home").classList.remove("hidden");
  renderCourses();
  renderStats();
  get("courses").querySelector(".course-start")?.focus();
});
document.querySelectorAll(".clear").forEach((button) => {
  button.addEventListener("click", clearWorkCanvas);
});

"use strict";

const STORAGE_KEY = "studri-division-v1";
const SOUND_KEY = `${STORAGE_KEY}-sound`;
const COURSE_IDS = new Set([
  "g3-table",
  "g3-two",
  "g3-three",
  "g3-exact",
  "g3-remainder",
  "g3-fact-family",
  "g3-dividend",
  "g3-quotient",
  "g3-remainder-review",
  "g3-fluency",
  "g3-mix",
  "g3-finish",
]);

const courses = [
  { id: "g3-table", name: "九九のわり算", desc: "九九を使って、ぴったり分けよう", divisor: 9, quotient: 9 },
  { id: "g3-two", name: "2けた÷1けた", desc: "九九の答えを広げて計算しよう", divisor: 9, quotient: 12 },
  { id: "g3-three", name: "3けた÷1けた", desc: "大きな数も正確に分けよう", divisor: 9, quotient: 32 },
  { id: "g3-exact", name: "あまりなしの計算", desc: "商を考えて、ぴったり分けよう", divisor: 9, quotient: 45 },
  { id: "g3-remainder", name: "あまりのあるわり算", desc: "商とあまりをセットで答えよう", divisor: 9, quotient: 20, remainder: true },
  { id: "g3-fact-family", name: "かけ算から考えよう", desc: "九九のきまりを使ってみよう", divisor: 9, quotient: 30 },
  { id: "g3-dividend", name: "大きな数を分けよう", desc: "3けたの数にも挑戦しよう", divisor: 9, quotient: 60 },
  { id: "g3-quotient", name: "商を見つけよう", desc: "わる数と商の組み合わせに注目", divisor: 9, quotient: 80 },
  { id: "g3-remainder-review", name: "あまりをたしかめよう", desc: "あまりのある計算を練習しよう", divisor: 9, quotient: 50, remainder: true },
  { id: "g3-fluency", name: "わり算スピードアップ", desc: "いろいろな数をすばやく計算", divisor: 9, quotient: 70, remainder: true },
  { id: "g3-mix", name: "わり算ミックス", desc: "ぴったり？あまりあり？見きわめよう", divisor: 9, quotient: 80, remainder: true },
  { id: "g3-finish", name: "わり算名人コース", desc: "小学3年生のわり算をまとめて練習", divisor: 9, quotient: 80, remainder: true },
];

const defaultData = () => ({ course: "g3-table", stats: {}, wrong: [] });
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
      course: COURSE_IDS.has(saved.course) ? saved.course : "g3-table",
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

  courses.forEach((course, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `course${selectedCourse === course.id ? " selected" : ""}`;
    button.dataset.course = course.id;
    button.dataset.step = String(index + 1);
    button.setAttribute("aria-label", `小学3年生、${course.name}。${course.desc}`);

    const grade = document.createElement("span");
    grade.className = "grade";
    grade.textContent = "小学3年生";
    const name = document.createElement("strong");
    name.textContent = course.name;
    const description = document.createElement("small");
    description.textContent = course.desc;

    button.append(grade, name, description);
    button.addEventListener("click", () => {
      selectedCourse = course.id;
      data.course = selectedCourse;
      save();
      renderCourses();
      renderStats();
      setupQuiz();
    });
    courseList.append(button);
  });
}

function renderStats() {
  const stats = data.stats[selectedCourse] || { streak: 0, attempts: 0, best: null };
  get("streak").textContent = String(stats.streak);
  get("attempts").textContent = String(stats.attempts);
  get("best").textContent = stats.best ? `${stats.best}秒` : "—";
  get("passBadge").textContent = stats.streak >= 3
    ? "合格！チャレンジ解放"
    : `合格まであと${Math.max(0, 3 - stats.streak)}回`;
  get("wrongCount").textContent = `${data.wrong.length}問`;

  const reviewList = get("reviewList");
  reviewList.replaceChildren();
  if (data.wrong.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "まだまちがいはありません。挑戦してみよう！";
    reviewList.append(emptyMessage);
    return;
  }

  data.wrong.slice(-8).reverse().forEach((entry) => {
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
  const divisor = randomInteger(2, Math.min(course.divisor, 3 + level));
  const quotient = randomInteger(2, Math.min(course.quotient, 5 + level * 9));
  const remainder = course.remainder ? randomInteger(1, divisor - 1) : 0;
  const dividend = divisor * quotient + remainder;
  const explanation = remainder
    ? `${divisor}×${quotient}=${divisor * quotient}、${dividend}-${divisor * quotient}=${remainder}。答えは${quotient}あまり${remainder}です。`
    : `${divisor}×${quotient}=${dividend}。答えは${quotient}です。`;

  return {
    text: `${dividend} ÷ ${divisor} =`,
    answer: remainder ? `${quotient}あまり${remainder}` : String(quotient),
    unit: remainder ? "こ（あまりも入力）" : "こ",
    explanation,
  };
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
    : `正解は「${problem.answer}」です。`;
  content.append(title, message);

  if (!isCorrect) {
    const explanation = document.createElement("p");
    explanation.className = "feedback-answer";
    explanation.textContent = problem.explanation;
    content.append(explanation);
    data.wrong.push({
      grade: 3,
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
    const next = document.createElement("button");
    next.type = "button";
    next.className = "secondary";
    next.textContent = "次へ";
    next.addEventListener("click", advanceQuiz);
    actions.append(next);
  }

  dialog.showModal();
  primary.focus();
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
  get("resultTitle").textContent = quiz.correct === 10
    ? (quiz.missed ? "ぜんもん正解！" : "パーフェクト！")
    : "よくがんばったね！";
  get("resultMessage").textContent = quiz.correct === 10
    ? (quiz.missed
      ? "再回答して全問正解！ただし挑戦中にミスがあったので、連続合格は0回からだよ。"
      : `ミスなし合格 ${stats.streak}/3回。${stats.streak >= 3 ? "チャレンジモードが解放されたよ！" : "あと少しで合格だよ！"}`)
    : "まちがいはノートに保存したよ。もう一度やってみよう。";
  get("chainBest").textContent = localStorage.getItem(`${STORAGE_KEY}-chain`) || "0";
  get("timeAttack").disabled = stats.streak < 3;
  get("chainAttack").disabled = stats.streak < 3;
  renderStats();
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
const clearAnswerCanvas = setupCanvas("answerCanvas");
const clearNoteCanvas = setupCanvas("noteCanvas");
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
get("homeButton").addEventListener("click", returnToCourses);
get("resetData").addEventListener("click", () => {
  if (!confirm("学習記録とまちがいノートをすべて削除しますか？")) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(`${STORAGE_KEY}-chain`);
  data = defaultData();
  selectedCourse = "g3-table";
  renderCourses();
  renderStats();
});
get("sound").setAttribute("aria-pressed", String(soundEnabled));
get("sound").textContent = soundEnabled ? "🔔 音あり" : "🔕 消音";
get("sound").addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  localStorage.setItem(SOUND_KEY, String(soundEnabled));
  get("sound").setAttribute("aria-pressed", String(soundEnabled));
  get("sound").textContent = soundEnabled ? "🔔 音あり" : "🔕 消音";
});
document.querySelectorAll(".clear").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.canvas === "answerCanvas") clearAnswerCanvas();
    else clearNoteCanvas();
  });
});

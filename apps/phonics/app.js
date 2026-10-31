"use strict";

const STORAGE_KEY = "studri-phonics-v1";
const SOUND_KEY = `${STORAGE_KEY}-sound`;
const QUIZ_LENGTH = 10;
const PASS_STREAK = 3;
const MAX_WRONG_ENTRIES = 50;
const MAX_HISTORY_ENTRIES = 50;
const TRACE_RETENTION_MS = 2 * 24 * 60 * 60 * 1000;
const FEEDBACK_AUTO_ADVANCE_MS = 3000;
const CANVAS_BRUSH_WIDTH = 3;
const MAX_CANVAS_SNAPSHOT_WIDTH = 360;

const courses = [
  { id: "alphabet", title: "アルファベットの音", icon: "🔤", summary: "26文字の基本音と、その音で始まる単語" },
  { id: "short-vowels", title: "短母音とCVC", icon: "🍎", summary: "短い母音の音と、子音・母音・子音の単語" },
  { id: "consonant-teams", title: "子音の組み合わせ", icon: "🐚", summary: "sh・ch・th・ph・wh などのつづり" },
  { id: "silent-e", title: "サイレントe", icon: "✨", summary: "語尾のeで母音の音が変わる単語" },
  { id: "vowel-teams", title: "母音チーム", icon: "🌈", summary: "ai・ee・oa・oo などの母音の組み合わせ" },
];

const questionBank = {
  alphabet: [
    { level: 0, prompt: "sun の最初の音はどれ？", word: "sun", answer: "/s/", choices: ["/s/", "/m/", "/t/", "/f/"], explanation: "sun は /s/ の音で始まるよ。S の音を思い出そう。" },
    { level: 0, prompt: "map の最初の音はどれ？", word: "map", answer: "/m/", choices: ["/m/", "/n/", "/b/", "/p/"], explanation: "map は /m/ の音で始まるよ。唇を閉じて出す音だよ。" },
    { level: 0, prompt: "fish の最初の音はどれ？", word: "fish", answer: "/f/", choices: ["/f/", "/v/", "/s/", "/h/"], explanation: "fish は /f/ の音で始まるよ。" },
    { level: 0, prompt: "dog の最初の音はどれ？", word: "dog", answer: "/d/", choices: ["/d/", "/b/", "/g/", "/t/"], explanation: "dog は /d/ の音で始まるよ。" },
    { level: 1, prompt: "bag の最初の音を表す文字は？", word: "bag", answer: "b", choices: ["b", "d", "p", "g"], explanation: "bag は b の音で始まる単語。文字 b が /b/ を表すよ。" },
    { level: 1, prompt: "kite の最初の音を表す文字は？", word: "kite", answer: "k", choices: ["k", "c", "t", "g"], explanation: "kite は /k/ の音で始まるよ。ここでは k がその音を表すよ。" },
    { level: 2, prompt: "van の最初の音はどれ？", word: "van", answer: "/v/", choices: ["/v/", "/f/", "/w/", "/b/"], explanation: "van は /v/ の音で始まるよ。f の音と区別してみよう。" },
    { level: 2, prompt: "zip の最初の音を表す文字は？", word: "zip", answer: "z", choices: ["z", "s", "j", "x"], explanation: "zip は /z/ の音で始まるよ。文字 z の音だね。" },
    { level: 3, prompt: "queen の最初の音の組み合わせは？", word: "queen", answer: "qu", choices: ["qu", "kw", "q", "ch"], explanation: "queen の最初の音は /kw/。つづりでは qu がその音を表すよ。" },
    { level: 3, prompt: "box の最後の音はどれ？", word: "box", answer: "/ks/", choices: ["/ks/", "/s/", "/z/", "/k/"], explanation: "box の x は語尾で /ks/ の音を表すよ。" },
    { level: 0, prompt: "red の最初の音を表す文字は？", word: "red", answer: "r", choices: ["r", "l", "w", "d"], explanation: "red は r の音で始まる単語だよ。" },
    { level: 1, prompt: "top の最初の音はどれ？", word: "top", answer: "/t/", choices: ["/t/", "/d/", "/p/", "/k/"], explanation: "top は /t/ の音で始まるよ。" },
    { level: 2, prompt: "jam の最初の音を表す文字は？", word: "jam", answer: "j", choices: ["j", "g", "y", "c"], explanation: "jam は /j/（/dʒ/）の音で始まるよ。文字 j が使われるね。" },
    { level: 3, prompt: "yes の最初の音はどれ？", word: "yes", answer: "/y/", choices: ["/y/", "/j/", "/i/", "/w/"], explanation: "yes の y は、ここでは /y/ の音だよ。" },
  ],
  "short-vowels": [
    { level: 0, prompt: "cat の母音 a の音はどれ？", word: "cat", answer: "/æ/", choices: ["/æ/", "/e/", "/ɪ/", "/ʌ/"], explanation: "cat の a は短い /æ/ の音だよ。" },
    { level: 0, prompt: "bed の母音 e の音はどれ？", word: "bed", answer: "/e/", choices: ["/e/", "/æ/", "/iː/", "/ɒ/"], explanation: "bed の e は短い /e/ の音だよ。" },
    { level: 0, prompt: "pig の母音 i の音はどれ？", word: "pig", answer: "/ɪ/", choices: ["/ɪ/", "/aɪ/", "/e/", "/uː/"], explanation: "pig の i は短い /ɪ/ の音だよ。" },
    { level: 1, prompt: "hot の母音 o の音はどれ？", word: "hot", answer: "/ɒ/", choices: ["/ɒ/", "/oʊ/", "/ʌ/", "/ɔɪ/"], explanation: "hot の o は短い /ɒ/ の音だよ。" },
    { level: 1, prompt: "sun の母音 u の音はどれ？", word: "sun", answer: "/ʌ/", choices: ["/ʌ/", "/uː/", "/ʊ/", "/æ/"], explanation: "sun の u は短い /ʌ/ の音だよ。" },
    { level: 1, prompt: "map のまんなかの音に合う文字は？", word: "m_p", answer: "a", choices: ["a", "e", "i", "u"], explanation: "map は m-a-p。まんなかの a が短い /æ/ の音を表すよ。" },
    { level: 2, prompt: "hen のまんなかの音に合う文字は？", word: "h_n", answer: "e", choices: ["e", "a", "o", "i"], explanation: "hen は h-e-n。e が短い /e/ の音を表すよ。" },
    { level: 2, prompt: "cup のまんなかの音はどれ？", word: "cup", answer: "/ʌ/", choices: ["/ʌ/", "/ɪ/", "/æ/", "/iː/"], explanation: "cup の u は短い /ʌ/ の音だよ。" },
    { level: 3, prompt: "fox のまんなかの音に合う文字は？", word: "f_x", answer: "o", choices: ["o", "a", "u", "e"], explanation: "fox は f-o-x。o が短い /ɒ/ の音を表すよ。" },
    { level: 3, prompt: "web のまんなかの音はどれ？", word: "web", answer: "/e/", choices: ["/e/", "/æ/", "/ɒ/", "/ʊ/"], explanation: "web の e は短い /e/ の音だよ。" },
    { level: 0, prompt: "fin の母音 i の音はどれ？", word: "fin", answer: "/ɪ/", choices: ["/ɪ/", "/iː/", "/e/", "/ʌ/"], explanation: "fin の i は短い /ɪ/ の音だよ。" },
    { level: 2, prompt: "bag の母音 a の音はどれ？", word: "bag", answer: "/æ/", choices: ["/æ/", "/e/", "/ɑː/", "/ʌ/"], explanation: "bag の a は短い /æ/ の音だよ。" },
  ],
  "consonant-teams": [
    { level: 0, prompt: "ship の sh が表す最初の音は？", word: "ship", answer: "/ʃ/", choices: ["/ʃ/", "/s/", "/tʃ/", "/h/"], explanation: "sh は2文字で /ʃ/ の音を表すよ。" },
    { level: 0, prompt: "chin の ch が表す最初の音は？", word: "chin", answer: "/tʃ/", choices: ["/tʃ/", "/ʃ/", "/k/", "/dʒ/"], explanation: "ch は2文字で /tʃ/ の音を表すよ。" },
    { level: 0, prompt: "thin の th が表す最初の音は？", word: "thin", answer: "/θ/", choices: ["/θ/", "/ð/", "/f/", "/t/"], explanation: "thin の th は /θ/ の音。舌先を歯の間に軽く出すよ。" },
    { level: 1, prompt: "this の th が表す最初の音は？", word: "this", answer: "/ð/", choices: ["/ð/", "/θ/", "/d/", "/z/"], explanation: "this の th は声を出す /ð/ の音だよ。" },
    { level: 1, prompt: "phone の ph が表す最初の音は？", word: "phone", answer: "/f/", choices: ["/f/", "/p/", "/h/", "/v/"], explanation: "ph は /f/ の音を表すつづりだよ。" },
    { level: 1, prompt: "whale の wh が表す最初の音は？", word: "whale", answer: "/w/", choices: ["/w/", "/h/", "/v/", "/f/"], explanation: "whale の wh は /w/ の音で始まるよ。" },
    { level: 2, prompt: "ring の ng が表す最後の音は？", word: "ring", answer: "/ŋ/", choices: ["/ŋ/", "/n/", "/g/", "/ŋg/"], explanation: "ng は語尾で /ŋ/ の音を表すことがあるよ。" },
    { level: 2, prompt: "duck の ck が表す最後の音は？", word: "duck", answer: "/k/", choices: ["/k/", "/s/", "/tʃ/", "/g/"], explanation: "ck は2文字で /k/ の音を表すよ。" },
    { level: 3, prompt: "shop の sh が表す最初の音は？", word: "shop", answer: "/ʃ/", choices: ["/ʃ/", "/tʃ/", "/ʒ/", "/s/"], explanation: "shop の sh は /ʃ/ の音だよ。" },
    { level: 3, prompt: "chat の ch が表す最初の音は？", word: "chat", answer: "/tʃ/", choices: ["/tʃ/", "/ʃ/", "/k/", "/h/"], explanation: "chat の ch は /tʃ/ の音だよ。" },
    { level: 1, prompt: "bath の th が表す最後の音は？", word: "bath", answer: "/θ/", choices: ["/θ/", "/ð/", "/t/", "/f/"], explanation: "bath の th は声を出さない /θ/ の音だよ。" },
    { level: 2, prompt: "sing の ng が表す最後の音は？", word: "sing", answer: "/ŋ/", choices: ["/ŋ/", "/n/", "/g/", "/dʒ/"], explanation: "sing の ng は /ŋ/ の音だよ。" },
  ],
  "silent-e": [
    { level: 0, prompt: "cap に e をつけた cape の a はどの音？", word: "cape", answer: "/eɪ/", choices: ["/eɪ/", "/æ/", "/e/", "/ɑː/"], explanation: "語尾の e は発音しないけれど、a をアルファベットの名前に近い /eɪ/ にするよ。" },
    { level: 0, prompt: "kit に e をつけた kite の i はどの音？", word: "kite", answer: "/aɪ/", choices: ["/aɪ/", "/ɪ/", "/iː/", "/eɪ/"], explanation: "語尾の e で i が /aɪ/ の音になるよ。" },
    { level: 0, prompt: "hop に e をつけた hope の o はどの音？", word: "hope", answer: "/oʊ/", choices: ["/oʊ/", "/ɒ/", "/ɔː/", "/ʌ/"], explanation: "語尾の e で o が /oʊ/ の音になるよ。" },
    { level: 1, prompt: "cub に e をつけた cube の u はどの音？", word: "cube", answer: "/juː/", choices: ["/juː/", "/ʌ/", "/ʊ/", "/uː/"], explanation: "語尾の e で u が /juː/ の音になる単語があるよ。" },
    { level: 1, prompt: "mad と made。語尾で発音しない文字は？", word: "made", answer: "e", choices: ["e", "a", "d", "m"], explanation: "made の最後の e は発音しないサイレントeだよ。" },
    { level: 1, prompt: "not と note。語尾で発音しない文字は？", word: "note", answer: "e", choices: ["e", "o", "t", "n"], explanation: "note の最後の e は発音しないよ。o の音が変わる合図だね。" },
    { level: 2, prompt: "fin と fine。母音 i が変わる理由は？", word: "fine", answer: "最後のe", choices: ["最後のe", "最初のf", "語尾のn", "母音がない"], explanation: "語尾の e が i の音を /aɪ/ に変えるよ。" },
    { level: 2, prompt: "pet と Pete。母音 e の音が変わる合図は？", word: "Pete", answer: "最後のe", choices: ["最後のe", "最初のP", "語尾のt", "文字が2つ"], explanation: "語尾の e によって、母音がアルファベットの名前の音になるよ。" },
    { level: 3, prompt: "tap と tape。語尾の e の音は？", word: "tape", answer: "発音しない", choices: ["発音しない", "/e/", "/iː/", "/ə/"], explanation: "サイレントeは語尾で発音せず、前の母音の音に影響するよ。" },
    { level: 3, prompt: "cut と cute。cute の u はどの音？", word: "cute", answer: "/juː/", choices: ["/juː/", "/ʌ/", "/ʊ/", "/aɪ/"], explanation: "cute の u は /juː/ の音。最後の e は発音しないよ。" },
    { level: 2, prompt: "hop と hope。hope の o はどの音？", word: "hope", answer: "/oʊ/", choices: ["/oʊ/", "/ɒ/", "/ʌ/", "/ɔɪ/"], explanation: "hope の o は /oʊ/。語尾の e が合図だよ。" },
    { level: 3, prompt: "rid と ride。ride の i はどの音？", word: "ride", answer: "/aɪ/", choices: ["/aɪ/", "/ɪ/", "/iː/", "/eɪ/"], explanation: "ride の i は /aɪ/ の音だよ。" },
  ],
  "vowel-teams": [
    { level: 0, prompt: "rain の ai が表す母音の音は？", word: "rain", answer: "/eɪ/", choices: ["/eɪ/", "/æ/", "/iː/", "/aɪ/"], explanation: "rain の ai は /eɪ/ の音を表すよ。" },
    { level: 0, prompt: "seed の ee が表す母音の音は？", word: "seed", answer: "/iː/", choices: ["/iː/", "/ɪ/", "/eɪ/", "/uː/"], explanation: "seed の ee は /iː/ の音を表すよ。" },
    { level: 0, prompt: "boat の oa が表す母音の音は？", word: "boat", answer: "/oʊ/", choices: ["/oʊ/", "/ɒ/", "/ɔɪ/", "/aʊ/"], explanation: "boat の oa は /oʊ/ の音を表すよ。" },
    { level: 1, prompt: "moon の oo が表す母音の音は？", word: "moon", answer: "/uː/", choices: ["/uː/", "/ʊ/", "/ʌ/", "/ɔː/"], explanation: "moon の oo は /uː/ の音だよ。" },
    { level: 1, prompt: "book の oo が表す母音の音は？", word: "book", answer: "/ʊ/", choices: ["/ʊ/", "/uː/", "/oʊ/", "/ɒ/"], explanation: "book の oo は moon と違って、短い /ʊ/ の音だよ。" },
    { level: 1, prompt: "seed のまんなかの音に合うつづりは？", word: "s__d", answer: "ee", choices: ["ee", "ea", "ai", "oa"], explanation: "seed は ee が /iː/ の音を表すよ。" },
    { level: 2, prompt: "play の ay が表す母音の音は？", word: "play", answer: "/eɪ/", choices: ["/eɪ/", "/æ/", "/aɪ/", "/ɔɪ/"], explanation: "play の ay は /eɪ/ の音を表すよ。" },
    { level: 2, prompt: "coin の oi が表す母音の音は？", word: "coin", answer: "/ɔɪ/", choices: ["/ɔɪ/", "/oʊ/", "/aɪ/", "/aʊ/"], explanation: "coin の oi は /ɔɪ/ の音だよ。" },
    { level: 3, prompt: "cloud の ou が表す母音の音は？", word: "cloud", answer: "/aʊ/", choices: ["/aʊ/", "/oʊ/", "/uː/", "/ɔɪ/"], explanation: "cloud の ou は /aʊ/ の音を表すよ。" },
    { level: 3, prompt: "train の ai が表す母音の音は？", word: "train", answer: "/eɪ/", choices: ["/eɪ/", "/aɪ/", "/æ/", "/e/"], explanation: "train の ai は /eɪ/ の音だよ。" },
    { level: 2, prompt: "day の ay が表す母音の音は？", word: "day", answer: "/eɪ/", choices: ["/eɪ/", "/æ/", "/aɪ/", "/iː/"], explanation: "day の ay は /eɪ/ の音を表すよ。" },
    { level: 3, prompt: "book の oo が表す母音の音は？", word: "book", answer: "/ʊ/", choices: ["/ʊ/", "/uː/", "/əʊ/", "/ɪ/"], explanation: "book の oo は短い /ʊ/ の音だよ。" },
  ],
};

const defaultData = () => ({ stats: {}, wrong: [], history: [] });
const getElement = (id) => document.getElementById(id);
let learningData = loadLearningData();
let selectedCourse = courses[0].id;
let quiz = null;
let locked = false;
let advanceTimer = null;
let modeTimer = null;
let soundEnabled = localStorage.getItem(SOUND_KEY) !== "false";
let audioContext = null;
let writingCanvas = null;
let resizeCanvas = null;
let hasInk = false;
let isDrawing = false;

function loadLearningData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved || typeof saved !== "object") return defaultData();
    const courseIds = new Set(courses.map((course) => course.id));
    const stats = Object.fromEntries(
      Object.entries(saved.stats || {}).filter(([courseId]) => courseIds.has(courseId)),
    );
    const recentWrong = Array.isArray(saved.wrong) ? saved.wrong : [];
    const recentHistory = Array.isArray(saved.history) ? saved.history : [];
    return {
      stats,
      wrong: recentWrong.filter((entry) => entry && courseIds.has(entry.courseId)).slice(-MAX_WRONG_ENTRIES),
      history: recentHistory.slice(-MAX_HISTORY_ENTRIES),
    };
  } catch {
    return defaultData();
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(learningData));
}

function getStats(courseId) {
  return learningData.stats[courseId] || {
    streak: 0, attempts: 0, best: null, timeBest: null, chainBest: 0,
  };
}

function renderCourses() {
  const list = getElement("courses");
  list.replaceChildren();
  courses.forEach((course) => list.append(createCourseCard(course)));
}

function createCourseCard(course) {
  const stats = getStats(course.id);
  const card = document.createElement("article");
  card.className = `course${stats.streak >= PASS_STREAK ? " is-complete" : ""}`;
  card.dataset.course = course.id;

  const copy = document.createElement("div");
  copy.className = "course-copy";
  const title = document.createElement("strong");
  title.textContent = `${course.icon} ${course.title}`;
  const summary = document.createElement("small");
  summary.textContent = course.summary;
  copy.append(title, summary, createCourseStats(stats));

  const actions = document.createElement("div");
  actions.className = "course-actions";
  actions.append(createCourseButton("学習する", "start-course", () => startQuiz(course.id)));
  actions.append(createCourseButton("誤答ログ", "outline", () => showCourseLog(course)));
  actions.append(createCourseButton("手書き記録", "outline", () => showTraceLog(course)));

  const challenges = createChallenges(course, stats);
  card.append(copy, actions, challenges);
  return card;
}

function createCourseStats(stats) {
  const meta = document.createElement("span");
  meta.className = "course-meta";
  meta.textContent = `合格ステップ ${Math.min(stats.streak, PASS_STREAK)}/${PASS_STREAK}　挑戦 ${stats.attempts}回　ベスト ${stats.best ? `${stats.best}秒` : "--"}`;
  return meta;
}

function createCourseButton(label, className, action) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", action);
  return button;
}

function createChallenges(course, stats) {
  const group = document.createElement("div");
  group.className = "course-challenges";
  const label = document.createElement("span");
  label.textContent = "チャレンジ";
  const unlocked = stats.streak >= PASS_STREAK;
  const hint = document.createElement("small");
  hint.textContent = unlocked ? "解放中" : `ミスなし合格 あと${PASS_STREAK - stats.streak}回で解放`;
  group.append(label, hint);

  const timeButton = createCourseButton("⏱ タイムアタック", "outline", () => startQuiz(course.id, "time"));
  const chainButton = createCourseButton("🔥 連続正解", "outline", () => startQuiz(course.id, "chain"));
  timeButton.disabled = !unlocked;
  chainButton.disabled = !unlocked;
  group.append(timeButton, chainButton);
  return group;
}

function showCourseLog(course) {
  hidePanels();
  getElement("courses").classList.add("hidden");
  const panel = getElement("reviewPanel");
  panel.classList.remove("hidden");
  getElement("reviewTitle").textContent = `まちがいノート：${course.title}`;
  const list = getElement("reviewList");
  list.replaceChildren();
  const entries = learningData.wrong.filter((entry) => entry.courseId === course.id);
  if (!entries.length) {
    list.append(createEmptyMessage("まだまちがいはありません。挑戦してみよう！"));
    return;
  }
  entries.slice(-12).reverse().forEach((entry) => list.append(createReviewItem(entry)));
}

function showTraceLog(course) {
  hidePanels();
  getElement("courses").classList.add("hidden");
  const panel = getElement("tracePanel");
  panel.classList.remove("hidden");
  getElement("traceTitle").textContent = `手書きの見直し：${course.title}`;
  const list = getElement("traceList");
  list.replaceChildren();
  const entries = learningData.wrong.filter((entry) =>
    entry.courseId === course.id && entry.trace && Date.now() - entry.createdAt < TRACE_RETENTION_MS,
  );
  if (!entries.length) {
    list.append(createEmptyMessage("2日以内の手書き記録はありません。"));
    return;
  }
  entries.slice().reverse().forEach((entry) => list.append(createReviewItem(entry)));
}

function createEmptyMessage(text) {
  const message = document.createElement("p");
  message.textContent = text;
  return message;
}

function createReviewItem(entry) {
  const item = document.createElement("article");
  item.className = "review-item";
  const question = document.createElement("strong");
  question.textContent = entry.prompt;
  const word = document.createElement("p");
  word.textContent = entry.word;
  const mistake = document.createElement("p");
  mistake.className = "mistake";
  mistake.textContent = `あなたの答え：${entry.answer} / 正解：${entry.correct}`;
  const explanation = document.createElement("p");
  explanation.textContent = entry.explanation;
  item.append(question, word, mistake, explanation);
  if (entry.reviewed) {
    const reviewed = document.createElement("small");
    reviewed.textContent = "✅ 解き直し済み";
    item.append(reviewed);
  }
  if (entry.trace) {
    const image = document.createElement("img");
    image.src = entry.trace;
    image.alt = "この問題に取り組んだときの手書き記録";
    item.append(image);
  }
  item.append(createCourseButton("この問題を解き直す", "outline", () => startReview(entry)));
  return item;
}

function hidePanels() {
  getElement("reviewPanel").classList.add("hidden");
  getElement("tracePanel").classList.add("hidden");
  getElement("courses").classList.remove("hidden");
}

function startQuiz(courseId, mode = "basic") {
  clearInterval(modeTimer);
  selectedCourse = courseId;
  const stats = getStats(courseId);
  if (mode !== "basic" && stats.streak < PASS_STREAK) return;
  stats.attempts += 1;
  learningData.stats[courseId] = stats;
  quiz = {
    mode, index: 0, correct: 0, missed: false, started: Date.now(),
    previousAnswer: "", chainRun: 0, bestChain: 0, questions: [], submitted: [],
  };
  if (mode === "time") modeTimer = setInterval(updateModeStatus, 1000);
  learningData.history.push({
    courseId, mode, startedAt: quiz.started, completed: false,
  });
  learningData.history = learningData.history.slice(-MAX_HISTORY_ENTRIES);
  saveData();
  showScreen("quiz");
  getElement("modeTitle").textContent = mode === "time"
    ? "⏱ タイムアタック" : mode === "chain" ? "🔥 連続正解" : "";
  getElement("modeTitle").classList.toggle("hidden", mode === "basic");
  renderProblem();
}

function startReview(entry) {
  const bankQuestion = questionBank[entry.courseId]
    .find((question) => question.prompt === entry.prompt);
  const choices = Array.isArray(entry.choices) ? entry.choices : bankQuestion?.choices;
  if (!choices?.length) throw new Error("復習問題の選択肢を読み込めません");
  quiz = {
    mode: "review", index: 0, correct: 0, missed: false,
    started: Date.now(), previousAnswer: "",
    questions: [{ ...bankQuestion, ...entry, choices, answer: entry.correct }],
    reviewEntry: entry,
    submitted: [],
  };
  selectedCourse = entry.courseId;
  showScreen("quiz");
  getElement("modeTitle").textContent = "📖 まちがい直し";
  getElement("modeTitle").classList.remove("hidden");
  renderProblem();
}

function showScreen(screen) {
  ["home", "quiz", "result"].forEach((id) => getElement(id).classList.toggle("hidden", id !== screen));
  if (screen === "quiz") requestAnimationFrame(() => resizeCanvas?.());
}

function selectQuestion(index) {
  const pool = questionBank[selectedCourse];
  const level = Math.min(3, Math.floor(index / 3));
  const available = pool.filter((question) => question.level <= level);
  const prior = new Set(quiz.questions.map((question) => question.prompt));
  const fresh = available.filter((question) => !prior.has(question.prompt));
  const choices = fresh.length ? fresh : available;
  return choices[Math.floor(Math.random() * choices.length)];
}

function renderProblem() {
  clearTimeout(advanceTimer);
  locked = false;
  const question = quiz.questions[quiz.index] || selectQuestion(quiz.index);
  quiz.questions[quiz.index] = question;
  getElement("questionNo").textContent = quiz.mode === "review"
    ? "解き直し" : `${quiz.index + 1} / ${QUIZ_LENGTH}`;
  getElement("progress").style.width = quiz.mode === "review"
    ? "100%" : `${quiz.index / QUIZ_LENGTH * 100}%`;
  getElement("questionCategory").textContent = `STEP ${Math.min(4, Math.floor(quiz.index / 3) + 1)} · ${courses.find((course) => course.id === selectedCourse).title}`;
  getElement("problem").textContent = question.prompt;
  getElement("wordCard").textContent = question.word;
  getElement("previousAnswer").textContent = quiz.previousAnswer
    ? `前回の答え：${quiz.previousAnswer}` : "";
  getElement("previousAnswer").classList.toggle("hidden", !quiz.previousAnswer);
  renderChoices(question);
  updateModeStatus();
  clearWritingCanvas();
}

function renderChoices(question) {
  const answers = getElement("answers");
  answers.replaceChildren();
  question.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-choice";
    button.textContent = choice;
    button.addEventListener("click", () => judgeAnswer(choice));
    answers.append(button);
  });
}

function updateModeStatus() {
  if (!quiz) return;
  if (quiz.mode === "time") {
    const seconds = Math.floor((Date.now() - quiz.started) / 1000);
    getElement("modeStatus").textContent = `⏱ ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
    return;
  }
  getElement("modeStatus").textContent = quiz.mode === "chain"
    ? `🔥 ${quiz.bestChain}問連続` : "";
}

function judgeAnswer(answer) {
  if (locked || !quiz) return;
  locked = true;
  const question = quiz.questions[quiz.index];
  const isCorrect = answer === question.answer;
  quiz.previousAnswer = answer;
  quiz.submitted[quiz.index] = answer;
  if (!isCorrect) recordMistake(question, answer);
  if (isCorrect) {
    if (quiz.mode === "review") quiz.reviewSolved = true;
    quiz.correct += 1;
    quiz.chainRun += 1;
    quiz.bestChain = Math.max(quiz.bestChain, quiz.chainRun);
  } else {
    quiz.missed = true;
    quiz.chainRun = 0;
  }
  playFeedbackTone(isCorrect);
  showFeedback(isCorrect, question, answer);
}

function recordMistake(question, answer) {
  const entry = {
    courseId: selectedCourse,
    prompt: question.prompt,
    word: question.word,
    answer,
    correct: question.answer,
    choices: question.choices,
    explanation: question.explanation,
    createdAt: Date.now(),
  };
  const trace = captureWriting();
  if (trace) entry.trace = trace;
  learningData.wrong.push(entry);
  learningData.wrong = learningData.wrong.slice(-MAX_WRONG_ENTRIES);
  saveData();
}

function showFeedback(isCorrect, question, answer) {
  const dialog = getElement("feedback");
  const content = getElement("feedbackContent");
  const actions = getElement("feedbackActions");
  content.replaceChildren();
  actions.replaceChildren();
  dialog.className = `feedback-dialog ${isCorrect ? "ok" : "no"}`;
  const title = document.createElement("h2");
  title.id = "feedbackTitle";
  title.textContent = isCorrect ? "せいかい！ 🎉" : "もう一度考えてみよう";
  const message = document.createElement("p");
  message.textContent = isCorrect
    ? "いい調子！音と文字のつながりが見えてきたね。"
    : `ヒント：${question.explanation}`;
  content.append(title, message);

  const primary = createFeedbackButton(
    isCorrect ? "つぎへ ↵" : "再回答",
    isCorrect ? advanceQuiz : retryQuestion,
  );
  actions.append(primary);
  if (!isCorrect) {
    const answer = document.createElement("p");
    answer.className = "feedback-answer";
    answer.textContent = `正解：「${question.answer}」`;
    content.append(answer);
    actions.append(createFeedbackButton("次へ", advanceQuiz, "secondary"));
  }
  dialog.showModal();
  primary.focus();
  if (isCorrect) advanceTimer = setTimeout(advanceQuiz, FEEDBACK_AUTO_ADVANCE_MS);
}

function createFeedbackButton(label, action, className = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", action);
  return button;
}

function retryQuestion() {
  closeFeedback();
  locked = false;
  renderChoices(quiz.questions[quiz.index]);
  getElement("answers").querySelector("button")?.focus();
  getElement("previousAnswer").classList.remove("hidden");
}

function closeFeedback() {
  clearTimeout(advanceTimer);
  if (getElement("feedback").open) getElement("feedback").close();
}

function advanceQuiz() {
  closeFeedback();
  if (quiz.mode === "review") {
    finishReview();
    return;
  }
  quiz.previousAnswer = "";
  quiz.index += 1;
  if (quiz.index >= QUIZ_LENGTH) {
    finishQuiz();
    return;
  }
  renderProblem();
}

function finishReview() {
  if (quiz.reviewSolved) quiz.reviewEntry.reviewed = true;
  saveData();
  showScreen("home");
  renderCourses();
}

function finishQuiz() {
  clearInterval(modeTimer);
  const elapsedSeconds = Math.max(1, Math.round((Date.now() - quiz.started) / 1000));
  const stats = getStats(selectedCourse);
  if (quiz.mode === "basic") {
    stats.streak = quiz.correct === QUIZ_LENGTH && !quiz.missed ? stats.streak + 1 : 0;
    if (quiz.correct === QUIZ_LENGTH && !quiz.missed) {
      stats.best = stats.best ? Math.min(stats.best, elapsedSeconds) : elapsedSeconds;
    }
  }
  if (quiz.mode === "time" && !quiz.missed) {
    stats.timeBest = stats.timeBest ? Math.min(stats.timeBest, elapsedSeconds) : elapsedSeconds;
  }
  if (quiz.mode === "chain") stats.chainBest = Math.max(stats.chainBest, quiz.bestChain);
  learningData.stats[selectedCourse] = stats;
  completeHistory();
  saveData();
  renderResult(stats, elapsedSeconds);
}

function completeHistory() {
  const attempt = learningData.history.at(-1);
  if (!attempt || attempt.completed) return;
  Object.assign(attempt, {
    completed: true,
    score: quiz.correct,
    missed: quiz.missed,
    finishedAt: Date.now(),
  });
}

function renderResult(stats, elapsedSeconds) {
  showScreen("result");
  const isPerfect = quiz.correct === QUIZ_LENGTH && !quiz.missed;
  const titles = { basic: isPerfect ? "ミスなし！" : "よくがんばったね！", time: "⏱ タイムアタック", chain: "🔥 連続正解チャレンジ" };
  getElement("resultTitle").textContent = titles[quiz.mode];
  getElement("score").textContent = `${quiz.correct} / ${QUIZ_LENGTH} 問 正解`;
  getElement("resultMessage").textContent = quiz.mode === "basic"
    ? `ミスなし合格 ${stats.streak}/${PASS_STREAK}回。${quiz.missed ? "まちがいノートで復習してみよう。" : "その調子で進もう！"}`
    : quiz.mode === "time"
      ? `${elapsedSeconds}秒。ベスト記録：${stats.timeBest ?? "--"}秒`
      : `今回の最高連続正解：${quiz.bestChain}問。ベスト記録：${stats.chainBest}問`;
  renderAnswerSummary();
  getElement("timeBest").textContent = stats.timeBest ? `${stats.timeBest}秒` : "--";
  getElement("chainBest").textContent = `${stats.chainBest}問`;
  const unlocked = stats.streak >= PASS_STREAK;
  getElement("timeAttack").disabled = !unlocked;
  getElement("chainAttack").disabled = !unlocked;
  renderCourses();
}

function renderAnswerSummary() {
  const summary = getElement("answerSummary");
  summary.replaceChildren();
  quiz.questions.forEach((question, index) => {
    const item = document.createElement("article");
    const prompt = document.createElement("strong");
    prompt.textContent = `${index + 1}. ${question.prompt} (${question.word})`;
    const answer = document.createElement("small");
    answer.textContent = `あなたの答え：${quiz.submitted[index] || "未回答"} / 正解：${question.answer}`;
    const explanation = document.createElement("small");
    explanation.textContent = question.explanation;
    item.append(prompt, answer, explanation);
    summary.append(item);
  });
}

function returnToCourses() {
  clearInterval(modeTimer);
  if (quiz && quiz.mode !== "review" && quiz.index < QUIZ_LENGTH) {
    const attempt = learningData.history.at(-1);
    if (attempt && !attempt.completed) {
      attempt.abandonedAt = Date.now();
      attempt.progress = quiz.index;
      saveData();
    }
  }
  clearTimeout(advanceTimer);
  closeFeedback();
  quiz = null;
  showScreen("home");
  hidePanels();
  renderCourses();
}

function initializeCanvas() {
  writingCanvas = getElement("writingCanvas");
  const context = writingCanvas.getContext("2d");
  resizeCanvas = () => {
    const bounds = writingCanvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    writingCanvas.width = Math.max(1, Math.round(bounds.width * scale));
    writingCanvas.height = Math.max(1, Math.round(bounds.height * scale));
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.lineWidth = CANVAS_BRUSH_WIDTH;
    context.lineCap = "round";
    context.strokeStyle = "#53795d";
  };
  resizeCanvas();
  writingCanvas.addEventListener("pointerdown", (event) => {
    isDrawing = true;
    writingCanvas.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(event.offsetX, event.offsetY);
  });
  writingCanvas.addEventListener("pointermove", (event) => {
    if (!isDrawing) return;
    context.lineTo(event.offsetX, event.offsetY);
    context.stroke();
    hasInk = true;
  });
  writingCanvas.addEventListener("pointerup", () => { isDrawing = false; });
  writingCanvas.addEventListener("pointercancel", () => { isDrawing = false; });
  window.addEventListener("resize", resizeCanvas);
}

function clearWritingCanvas() {
  if (!writingCanvas) return;
  const context = writingCanvas.getContext("2d");
  context.clearRect(0, 0, writingCanvas.width, writingCanvas.height);
  hasInk = false;
}

function captureWriting() {
  if (!hasInk) return "";
  const width = Math.min(MAX_CANVAS_SNAPSHOT_WIDTH, writingCanvas.width);
  const snapshot = document.createElement("canvas");
  snapshot.width = width;
  snapshot.height = Math.max(1, Math.round(writingCanvas.height * width / writingCanvas.width));
  const context = snapshot.getContext("2d");
  context.fillStyle = "#fff";
  context.fillRect(0, 0, snapshot.width, snapshot.height);
  context.drawImage(writingCanvas, 0, 0, snapshot.width, snapshot.height);
  return snapshot.toDataURL("image/png");
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
    volume.gain.setValueAtTime(0.0001, now);
    volume.gain.exponentialRampToValueAtTime(0.06, now + 0.02);
    volume.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    oscillator.connect(volume);
    volume.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.22);
  } catch {
    return;
  }
}

function registerEvents() {
  getElement("quit").addEventListener("click", () => {
    if (window.confirm("この挑戦を中断してコース選択に戻りますか？")) returnToCourses();
  });
  getElement("reviewBack").addEventListener("click", () => {
    getElement("reviewPanel").classList.add("hidden");
    getElement("courses").classList.remove("hidden");
  });
  getElement("traceBack").addEventListener("click", () => {
    getElement("tracePanel").classList.add("hidden");
    getElement("courses").classList.remove("hidden");
  });
  getElement("clearCanvas").addEventListener("click", clearWritingCanvas);
  getElement("resetData").addEventListener("click", resetLearningData);
  getElement("sound").addEventListener("click", toggleSound);
  getElement("again").addEventListener("click", () => startQuiz(selectedCourse));
  getElement("homeButton").addEventListener("click", returnToCourses);
  getElement("timeAttack").addEventListener("click", () => startQuiz(selectedCourse, "time"));
  getElement("chainAttack").addEventListener("click", () => startQuiz(selectedCourse, "chain"));
  document.addEventListener("keydown", handleFeedbackKey);
}

function handleFeedbackKey(event) {
  if (event.key !== "Enter" || !getElement("feedback").open) return;
  event.preventDefault();
  getElement("feedbackActions").querySelector("button")?.click();
}

function resetLearningData() {
  if (!window.confirm("学習記録と手書き記録をすべて削除しますか？")) return;
  localStorage.removeItem(STORAGE_KEY);
  learningData = defaultData();
  quiz = null;
  returnToCourses();
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem(SOUND_KEY, String(soundEnabled));
  getElement("sound").setAttribute("aria-pressed", String(soundEnabled));
  getElement("sound").setAttribute("aria-label", soundEnabled ? "音あり" : "音なし");
  getElement("sound").textContent = soundEnabled ? "🔊" : "🔇";
}

function removeExpiredTraces() {
  learningData.wrong.forEach((entry) => {
    if (entry.trace && Date.now() - entry.createdAt >= TRACE_RETENTION_MS) {
      delete entry.trace;
    }
  });
  saveData();
}

function initializeApplication() {
  removeExpiredTraces();
  initializeCanvas();
  registerEvents();
  toggleSoundState();
  renderCourses();
}

function toggleSoundState() {
  getElement("sound").setAttribute("aria-pressed", String(soundEnabled));
  getElement("sound").setAttribute("aria-label", soundEnabled ? "音あり" : "音なし");
  getElement("sound").textContent = soundEnabled ? "🔊" : "🔇";
}

initializeApplication();

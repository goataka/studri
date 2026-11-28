import { hintsFor } from "./hints";
import { emptyRecord, recordPractice, recordReview, shouldSuggestRetry, type CourseRecord } from "./mastery";
import { buildCourses, buildSession, QUESTIONS_PER_REVIEW, type Course, type Question } from "./quiz";
import { playTone, setSoundEnabled, soundEnabled } from "./sound";
import { addMistake, clearSave, load, save, type SaveData } from "./storage";
import { homeView, mistakesView, questionView, resultView, type ResultRow } from "./views";
import { kanjiEntries } from "./words";
import { escapeHtml } from "./render-word";

const PASS_SCORE = 9;
const REVIEW_PASS_SCORE = 4;
const AUTO_NEXT_MS = 3000;
const MAX_WRONG = 3;

type Session = {
  course: Course;
  review: boolean;
  questions: Question[];
  index: number;
  wrong: number;
  tried: string[];
  visible: string[];
  rows: ResultRow[];
};

const courses = buildCourses(kanjiEntries);
const app = document.getElementById("app") as HTMLElement;
const feedback = document.getElementById("feedback") as HTMLDialogElement;
const confirmReset = document.getElementById("confirmReset") as HTMLDialogElement;
const soundToggle = document.getElementById("soundToggle") as HTMLButtonElement;
let data: SaveData = load(localStorage);
let session: Session | null = null;
let autoNext: number | undefined;

const today = () => new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
const recordOf = (id: string): CourseRecord => data.courses[id] ?? emptyRecord();

function store(next: SaveData): void {
  data = next;
  save(localStorage, data);
}

function showHome(): void {
  session = null;
  app.innerHTML = homeView(courses, recordOf, today());
}

function startSession(course: Course, review: boolean): void {
  const questions = buildSession(course, Math.random, review ? QUESTIONS_PER_REVIEW : undefined);
  session = { course, review, questions, index: 0, wrong: 0, tried: [], visible: questions[0].choices, rows: [] };
  showQuestion();
}

function showQuestion(): void {
  if (!session) return;
  const question = session.questions[session.index];
  app.innerHTML = questionView(question, session.index, session.questions.length, session.tried, session.visible);
  app.querySelector<HTMLButtonElement>(".choice:not([disabled])")?.focus();
}

function openFeedback(title: string, body: string, actions: string): void {
  (document.getElementById("feedbackTitle") as HTMLElement).textContent = title;
  (document.getElementById("feedbackBody") as HTMLElement).innerHTML = body;
  (document.getElementById("feedbackActions") as HTMLElement).innerHTML = actions;
  feedback.showModal();
  feedback.querySelector<HTMLButtonElement>("button")?.focus();
}

function closeFeedback(): void {
  window.clearTimeout(autoNext);
  if (feedback.open) feedback.close();
}

function answer(choice: string): void {
  if (!session || feedback.open) return;
  const question = session.questions[session.index];
  if (choice === question.answer) return onCorrect();
  onWrong(question, choice);
}

function onCorrect(): void {
  if (!session) return;
  session.rows.push({ question: session.questions[session.index], firstTry: session.wrong === 0 });
  if (soundEnabled(localStorage)) playTone("correct");
  openFeedback("せいかい！", "", '<button type="button" class="button accent" data-action="next">つぎへ</button>');
  autoNext = window.setTimeout(nextQuestion, AUTO_NEXT_MS);
}

function onWrong(question: Question, choice: string): void {
  if (!session) return;
  session.wrong += 1;
  session.tried.push(choice);
  if (session.wrong === 1) {
    const mistake = { word: question.word.text, type: question.type, chosen: choice, answer: question.answer, date: today() };
    store(addMistake(data, mistake));
  }
  if (soundEnabled(localStorage)) playTone("wrong");
  if (session.wrong >= MAX_WRONG) return showAnswer(question);
  const hint = hintsFor(question, Math.random, session.tried)[session.wrong - 1];
  if (hint.choices) session.visible = hint.choices;
  openFeedback("ちがうよ", `<p class="hint">ヒント：${escapeHtml(hint.text)}</p>`, '<button type="button" class="button accent" data-action="retry">もう一ど</button>');
}

function showAnswer(question: Question): void {
  if (!session) return;
  session.rows.push({ question, firstTry: false });
  const body = `<p class="hint">正しい答え：<strong>${escapeHtml(question.answer)}</strong></p><p>${escapeHtml(question.word.text)}（${escapeHtml(question.word.reading)}）</p>`;
  openFeedback("答えを たしかめよう", body, '<button type="button" class="button accent" data-action="next">つぎへ</button>');
}

function nextQuestion(): void {
  closeFeedback();
  if (!session) return;
  session.index += 1;
  session.wrong = 0;
  session.tried = [];
  if (session.index >= session.questions.length) return finishSession();
  session.visible = session.questions[session.index].choices;
  showQuestion();
}

function finishSession(): void {
  if (!session) return;
  const { course, review, rows } = session;
  const score = rows.filter((row) => row.firstTry).length;
  const before = recordOf(course.id);
  const record = review ? recordReview(before, score) : recordPractice(before, score, today());
  store({ ...data, courses: { ...data.courses, [course.id]: record } });
  const message = !review && shouldSuggestRetry(record) ? "同じ コースを、ゆっくり もう一ど れんしゅうしよう。" : "";
  app.innerHTML = resultView(rows, review ? REVIEW_PASS_SCORE : PASS_SCORE, review, message);
}

function courseById(id: string | undefined): Course | undefined {
  return courses.find((course) => course.id === id);
}

function handleAction(action: string, target: HTMLElement): void {
  const course = courseById(target.dataset.course);
  const actions: Record<string, () => void> = {
    practice: () => course && startSession(course, false),
    review: () => course && startSession(course, true),
    again: () => session && startSession(session.course, session.review),
    home: showHome,
    back: showHome,
    mistakes: () => (app.innerHTML = mistakesView(data.mistakes)),
    next: nextQuestion,
    retry: () => (closeFeedback(), showQuestion()),
    reset: () => confirmReset.showModal(),
    "reset-confirm": () => (clearSave(localStorage), (data = load(localStorage)), confirmReset.close(), showHome()),
    "reset-cancel": () => confirmReset.close(),
  };
  actions[action]?.();
}

document.addEventListener("click", (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>("[data-action], [data-choice]");
  if (!target) return;
  if (target.dataset.choice !== undefined) return answer(target.dataset.choice);
  handleAction(target.dataset.action ?? "", target);
});

document.addEventListener("keydown", (event) => {
  if (feedback.open || !session) return;
  const position = Number(event.key) - 1;
  const choice = session.visible[position];
  if (choice !== undefined && !session.tried.includes(choice)) answer(choice);
});

function renderSoundToggle(): void {
  const enabled = soundEnabled(localStorage);
  soundToggle.setAttribute("aria-pressed", String(enabled));
  soundToggle.textContent = enabled ? "🔊 おと" : "🔇 おと";
}

// Esc でポップアップを閉じると次へ進めなくなるため、ボタンで閉じる
feedback.addEventListener("cancel", (event) => event.preventDefault());

soundToggle.addEventListener("click", () => {
  setSoundEnabled(localStorage, !soundEnabled(localStorage));
  renderSoundToggle();
});

(document.getElementById("version") as HTMLElement).textContent = __BUILD_VERSION__;
renderSoundToggle();
showHome();

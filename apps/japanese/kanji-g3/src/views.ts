import { courseStatus, nextReviewDate, type CourseRecord } from "./mastery";
import type { Course, Question } from "./quiz";
import { escapeHtml, renderWord } from "./render-word";
import type { Mistake } from "./storage";

const STATUS_LABEL = {
  new: "はじめよう",
  practicing: "れんしゅう中",
  "review-due": "ふくしゅうの日だよ",
  reviewing: "もう一どれんしゅうしよう",
  mastered: "ごうかく！",
  completed: "かんぺき！",
} as const;

function shortDate(date: string): string {
  const [, month, day] = date.split("-");
  return `${Number(month)}月${Number(day)}日`;
}

function courseDetail(record: CourseRecord, today: string): string {
  const status = courseStatus(record, today);
  if (status === "practicing") return `ごうかくの回 ${record.passDates.length}/2`;
  const next = nextReviewDate(record);
  if (status === "mastered" && next) return `つぎの ふくしゅう ${shortDate(next)}`;
  return "";
}

function courseCard(course: Course, record: CourseRecord, today: string): string {
  const status = courseStatus(record, today);
  const reviewButton =
    status === "review-due"
      ? `<button type="button" class="button accent" data-action="review" data-course="${course.id}">ふくしゅう</button>`
      : "";
  return `
    <li class="course status-${status}" data-course-id="${course.id}">
      <span class="course-number" aria-hidden="true">${course.number}</span>
      <div class="course-body">
        <h3 class="course-name">${escapeHtml(course.name)}</h3>
        <p class="course-kanji">${course.entries.map((entry) => entry.kanji).join(" ")}</p>
        <p class="course-status"><strong>${STATUS_LABEL[status]}</strong> ${courseDetail(record, today)}</p>
        <p class="course-record">ちょうせん ${record.attempts}回・いちばん ${record.best}/10</p>
      </div>
      <div class="course-actions">
        <button type="button" class="button" data-action="practice" data-course="${course.id}">れんしゅう</button>
        ${reviewButton}
      </div>
    </li>`;
}

export function homeView(courses: Course[], records: (id: string) => CourseRecord, today: string): string {
  const due = courses.filter((course) => courseStatus(records(course.id), today) === "review-due");
  const dueNotice = due.length
    ? `<p class="notice">ふくしゅうの日の コースが ${due.length}こ あるよ。先に ふくしゅうしよう。</p>`
    : "";
  return `
    <section class="hero">
      <img class="mascot" src="../../../studri.jpeg" alt="スタドリのキャラクター">
      <div>
        <h1>3年生の<ruby>漢<rt>かん</rt></ruby>字</h1>
        <p>10字ずつの コースで、読みと書きを れんしゅうしよう。</p>
      </div>
    </section>
    ${dueNotice}
    <ol class="course-map" aria-label="コース">${courses.map((course) => courseCard(course, records(course.id), today)).join("")}</ol>
    <div class="home-actions">
      <button type="button" class="button" data-action="mistakes">まちがえた もんだい</button>
      <button type="button" class="button danger" data-action="reset">きろくを けす</button>
    </div>`;
}

export function questionView(question: Question, index: number, total: number, tried: string[], visible: string[]): string {
  const isReading = question.type === "reading";
  const prompt = isReading
    ? `<p class="prompt-label">色の字の 読みは どれかな？</p><p class="word" data-word="${escapeHtml(question.word.text)}">${renderWord(question.word, "mark-target")}</p>`
    : `<p class="prompt-label">空いている ところに 入る字は どれかな？</p><p class="reading">${escapeHtml(question.word.reading)}</p><p class="word" data-word="${escapeHtml(question.word.text)}">${renderWord(question.word, "hide-target")}</p>`;
  const choices = visible
    .map(
      (choice, position) =>
        `<button type="button" class="choice${tried.includes(choice) ? " tried" : ""}" data-choice="${escapeHtml(choice)}" ${tried.includes(choice) ? "disabled" : ""}><span class="key" aria-hidden="true">${position + 1}</span>${escapeHtml(choice)}</button>`,
    )
    .join("");
  return `
    <section class="quiz" aria-label="もんだい">
      <div class="quiz-head">
        <button type="button" class="button small" data-action="back">もどる</button>
        <p class="progress">${index + 1} / ${total}</p>
        <p class="type-label">${isReading ? "読み" : "書き"}</p>
      </div>
      <div class="question">${prompt}</div>
      <div class="choices">${choices}</div>
    </section>`;
}

export type ResultRow = { question: Question; firstTry: boolean };

export function resultView(rows: ResultRow[], passScore: number, reviewMode: boolean, message: string): string {
  const score = rows.filter((row) => row.firstTry).length;
  const passed = score >= passScore;
  const comment = passed ? "よくできたね！" : "まちがえた字を、もう一ど たしかめよう。";
  const list = rows
    .map(
      ({ question, firstTry }) =>
        `<li class="${firstTry ? "ok" : "ng"}"><span>${firstTry ? "○" : "△"}</span> ${escapeHtml(question.word.text)}（${escapeHtml(question.word.reading)}）</li>`,
    )
    .join("");
  return `
    <section class="result" aria-label="けっか">
      <h2>${reviewMode ? "ふくしゅう" : "れんしゅう"}の けっか</h2>
      <p class="score">${score} / ${rows.length}</p>
      <p class="comment">${comment}</p>
      ${message ? `<p class="notice">${message}</p>` : ""}
      <ol class="answers">${list}</ol>
      <div class="home-actions">
        <button type="button" class="button accent" data-action="again">もう一ど</button>
        <button type="button" class="button" data-action="home">コースの一らんへ</button>
      </div>
    </section>`;
}

export function mistakesView(mistakes: Mistake[]): string {
  const rows = mistakes.length
    ? mistakes
        .map(
          (mistake) =>
            `<li><strong>${escapeHtml(mistake.word)}</strong>（${mistake.type === "reading" ? "読み" : "書き"}）えらんだ答え：${escapeHtml(mistake.chosen)}・正しい答え：${escapeHtml(mistake.answer)}</li>`,
        )
        .join("")
    : "<li>まだ ないよ。</li>";
  return `
    <section class="mistakes" aria-label="まちがえた もんだい">
      <h2>まちがえた もんだい</h2>
      <ol>${rows}</ol>
      <button type="button" class="button" data-action="home">コースの一らんへ</button>
    </section>`;
}

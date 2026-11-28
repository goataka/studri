import type { KanjiEntry, Word } from "./words";

export type Course = { id: string; number: number; name: string; entries: KanjiEntry[] };
export type QuestionType = "reading" | "writing";
export type Question = {
  type: QuestionType;
  entry: KanjiEntry;
  word: Word;
  otherWord: Word;
  choices: string[];
  answer: string;
};
export type Random = () => number;

export const QUESTIONS_PER_SESSION = 10;
export const QUESTIONS_PER_REVIEW = 5;
const KANJI_PER_COURSE = 10;
const CHOICE_COUNT = 4;

export function buildCourses(entries: readonly KanjiEntry[]): Course[] {
  const courses: Course[] = [];
  for (let start = 0; start < entries.length; start += KANJI_PER_COURSE) {
    const chunk = entries.slice(start, start + KANJI_PER_COURSE);
    const number = courses.length + 1;
    const name = `コース${number} ${chunk[0].kanji}～${chunk[chunk.length - 1].kanji}`;
    courses.push({ id: `course-${String(number).padStart(2, "0")}`, number, name, entries: chunk });
  }
  return courses;
}

export function shuffle<T>(items: readonly T[], random: Random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

function pickWord(entry: KanjiEntry, random: Random): [Word, Word] {
  const [first, second] = entry.words;
  return random() < 0.5 ? [first, second] : [second, first];
}

function readingWith(word: Word, targetReading: string): string {
  return word.segments.map((segment) => (segment.isTarget ? targetReading : segment.reading)).join("");
}

function readingChoices(word: Word, otherWord: Word, course: Course, random: Random): string[] {
  const segments = new Set([otherWord.targetReading]);
  course.entries.forEach((entry) => entry.words.forEach((candidate) => segments.add(candidate.targetReading)));
  const wrong = shuffle([...segments], random)
    .map((segment) => readingWith(word, segment))
    .filter((reading, index, all) => reading !== word.reading && all.indexOf(reading) === index);
  return shuffle([word.reading, ...wrong.slice(0, CHOICE_COUNT - 1)], random);
}

function writingChoices(entry: KanjiEntry, word: Word, course: Course, random: Random): string[] {
  const sameReading = (candidate: KanjiEntry) =>
    candidate.words.some((other) => other.targetReading === word.targetReading);
  const wrong = course.entries.filter((candidate) => candidate !== entry && !sameReading(candidate));
  const picked = shuffle(wrong, random).slice(0, CHOICE_COUNT - 1).map((candidate) => candidate.kanji);
  return shuffle([entry.kanji, ...picked], random);
}

export function buildQuestion(entry: KanjiEntry, type: QuestionType, course: Course, random: Random): Question {
  const [word, otherWord] = pickWord(entry, random);
  if (type === "reading") {
    return { type, entry, word, otherWord, choices: readingChoices(word, otherWord, course, random), answer: word.reading };
  }
  return { type, entry, word, otherWord, choices: writingChoices(entry, word, course, random), answer: entry.kanji };
}

export function buildSession(course: Course, random: Random, count = QUESTIONS_PER_SESSION): Question[] {
  const entries = shuffle(course.entries, random).slice(0, count);
  const types = shuffle(
    entries.map((_, index): QuestionType => (index % 2 === 0 ? "reading" : "writing")),
    random,
  );
  return entries.map((entry, index) => buildQuestion(entry, types[index], course, random));
}

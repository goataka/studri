import { describe, expect, it } from "vitest";
import { buildCourses, buildSession, QUESTIONS_PER_SESSION } from "./quiz";
import { kanjiEntries } from "./words";

function seeded(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 1103515245 + 12345) % 2147483648;
    return value / 2147483648;
  };
}

const courses = buildCourses(kanjiEntries);

describe("コース", () => {
  it("配当表の順に10字ずつ、20コースにする", () => {
    expect(courses).toHaveLength(20);
    expect(courses[0].name).toBe("コース1 悪～飲");
    courses.forEach((course) => expect(course.entries).toHaveLength(10));
  });
});

describe("1回の問題", () => {
  it("コースの10字を1問ずつ、読みと書きを5問ずつ出す", () => {
    courses.forEach((course, index) => {
      const session = buildSession(course, seeded(index + 1));
      expect(session).toHaveLength(QUESTIONS_PER_SESSION);
      expect(new Set(session.map((question) => question.entry.kanji)).size).toBe(10);
      expect(session.filter((question) => question.type === "reading")).toHaveLength(5);
    });
  });

  it("選択肢は4つで重ならず、答えを含む", () => {
    courses.forEach((course, index) =>
      buildSession(course, seeded(index + 100)).forEach((question) => {
        expect(question.choices).toHaveLength(4);
        expect(new Set(question.choices).size).toBe(4);
        expect(question.choices).toContain(question.answer);
      }),
    );
  });

  it("書きの誤りの選択肢には、答えと同じ読みの字を入れない", () => {
    courses.forEach((course, index) =>
      buildSession(course, seeded(index + 200))
        .filter((question) => question.type === "writing")
        .forEach((question) => {
          const wrong = course.entries.filter(
            (entry) => question.choices.includes(entry.kanji) && entry.kanji !== question.answer,
          );
          wrong.forEach((entry) =>
            entry.words.forEach((word) => expect(word.targetReading).not.toBe(question.word.targetReading)),
          );
        }),
    );
  });
});

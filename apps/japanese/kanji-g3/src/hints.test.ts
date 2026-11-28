import { describe, expect, it } from "vitest";
import { hintsFor } from "./hints";
import { buildCourses, buildQuestion } from "./quiz";
import { kanjiEntries } from "./words";

const course = buildCourses(kanjiEntries)[0];

describe("ヒント", () => {
  it("書きのヒント2は、答えと、まだ選んでいない字の2つにしぼる", () => {
    for (let trial = 0; trial < 50; trial += 1) {
      const question = buildQuestion(course.entries[trial % 10], "writing", course, Math.random);
      const tried = [question.choices.find((choice) => choice !== question.answer) as string];
      const [, second] = hintsFor(question, Math.random, tried);
      expect(second.choices).toHaveLength(2);
      expect(second.choices).toContain(question.answer);
      expect(second.choices?.some((choice) => tried.includes(choice))).toBe(false);
    }
  });

  it("読みのヒント2は、同じ字を使ったもう1つの言葉を見せる", () => {
    const question = buildQuestion(course.entries[0], "reading", course, () => 0);
    const [, second] = hintsFor(question, Math.random);
    expect(second.text).toContain(question.otherWord.text);
  });
});

import { describe, expect, it } from "vitest";
import { kanjiByGrade } from "./kanji-grades";
import { kanjiGrade, needsRuby } from "./ruby";

describe("学年別漢字配当表", () => {
  it("学年ごとの字数が配当表と同じ", () => {
    const counts = Object.values(kanjiByGrade).map((kanji) => [...kanji].length);
    expect(counts).toEqual([80, 160, 200, 202, 193, 191]);
  });
});

describe("ふりがなの判定", () => {
  it("前の学年の漢字にはふりがなを付けない", () => {
    expect(kanjiGrade("学")).toBe(1);
    expect(needsRuby("学", 3)).toBe(false);
  });

  it("その学年と後の学年の漢字にはふりがなを付ける", () => {
    expect(needsRuby("悪", 3)).toBe(true);
    expect(needsRuby("愛", 3)).toBe(true);
  });

  it("配当外の漢字と仮名を区別する", () => {
    expect(needsRuby("桁", 6)).toBe(true);
    expect(needsRuby("あ", 1)).toBe(false);
  });
});

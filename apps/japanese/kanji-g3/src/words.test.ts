import { describe, expect, it } from "vitest";
import { kanjiByGrade } from "../../../shared/kanji-grades";
import { elementaryReadings } from "../../../shared/onkun";
import { isKanji, kanjiGrade } from "../../../shared/ruby";
import { kanjiEntries, parseWord } from "./words";

const toHiragana = (text: string) =>
  [...text].map((char) => (/[ァ-ヶ]/.test(char) ? String.fromCharCode(char.charCodeAt(0) - 0x60) : char)).join("");
const removeVoicing = (text: string) => text.normalize("NFD").replace(/[゙゚]/g, "").normalize("NFC");

// 字の小学校の読みに合うか。訓読みは送りがなを除いた形、濁音と促音に変わる形も認める
function matchesReading(char: string, reading: string): boolean {
  const readings = (elementaryReadings[char] ?? "").split("、").map(toHiragana);
  const target = removeVoicing(reading);
  return readings.some((candidate) => {
    const base = removeVoicing(candidate);
    const sokuon = target.endsWith("っ") && base.startsWith(target.slice(0, -1));
    return base.startsWith(target) || sokuon;
  });
}

describe("言葉のデータ", () => {
  it("第3学年の200字に、言葉が2つずつある", () => {
    expect(kanjiEntries.map((entry) => entry.kanji).join("")).toBe(kanjiByGrade[3]);
    kanjiEntries.forEach((entry) => expect(entry.words).toHaveLength(2));
  });

  it("言葉は問う字を含み、ほかの字は第3学年までの字だけ", () => {
    kanjiEntries.forEach(({ kanji, words }) =>
      words.forEach((word) => {
        expect(word.text).toContain(kanji);
        [...word.text].filter(isKanji).forEach((char) => expect(kanjiGrade(char) ?? 9).toBeLessThanOrEqual(3));
      }),
    );
  });

  it("字ごとの読みが小学校の読みに合う", () => {
    const mismatches = kanjiEntries.flatMap(({ words }) =>
      words.flatMap((word) =>
        word.segments
          .filter((segment) => isKanji(segment.text) && !matchesReading(segment.text, segment.reading))
          .map((segment) => `${word.text}:${segment.text}=${segment.reading}`),
      ),
    );
    expect(mismatches).toEqual([]);
  });

  it("問う字の読みは、その字の区切りにある", () => {
    const word = parseWord("受け取る", "う・け・[と]・る");
    expect(word.reading).toBe("うけとる");
    expect(word.targetReading).toBe("と");
    expect(() => parseWord("受け取る", "うけ・[と]・る")).toThrow();
  });
});

import { describe, expect, it } from "vitest";
import { addMistake, emptySave, migrate } from "./storage";

describe("学習記録", () => {
  it("形のちがう記録は空の記録に読み替える", () => {
    expect(migrate(null)).toEqual(emptySave());
    expect(migrate({ version: 99 })).toEqual(emptySave());
  });

  it("足りない項目は初めの値で補う", () => {
    const data = migrate({ version: 1, courses: { "course-01": { attempts: 2 } }, mistakes: [] });
    expect(data.courses["course-01"].attempts).toBe(2);
    expect(data.courses["course-01"].passDates).toEqual([]);
  });

  it("まちがえた問題は新しい50件まで残す", () => {
    let data = emptySave();
    for (let index = 0; index < 60; index += 1) {
      data = addMistake(data, { word: `${index}`, type: "reading", chosen: "", answer: "", date: "2026-12-01" });
    }
    expect(data.mistakes).toHaveLength(50);
    expect(data.mistakes[0].word).toBe("59");
  });
});

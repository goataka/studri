import { describe, expect, it } from "vitest";
import { courseStatus, emptyRecord, nextReviewDate, recordPractice, recordReview, shouldSuggestRetry } from "./mastery";

describe("合格", () => {
  it("9問以上の回が日を変えて2回あれば合格", () => {
    let record = recordPractice(emptyRecord(), 9, "2026-12-01");
    record = recordPractice(record, 10, "2026-12-01");
    expect(record.masteredOn).toBeNull();
    record = recordPractice(record, 9, "2026-12-02");
    expect(record.masteredOn).toBe("2026-12-02");
    expect(courseStatus(record, "2026-12-02")).toBe("mastered");
  });

  it("合格しなかった回があっても、それまでの合格の回を消さない", () => {
    let record = recordPractice(emptyRecord(), 9, "2026-12-01");
    record = recordPractice(record, 3, "2026-12-02");
    expect(record.passDates).toEqual(["2026-12-01"]);
    expect(record.attempts).toBe(2);
    expect(record.best).toBe(9);
  });

  it("6問以下の回が2回続いたら、もう一度の練習を勧める", () => {
    const record = recordPractice(recordPractice(emptyRecord(), 6, "2026-12-01"), 5, "2026-12-01");
    expect(shouldSuggestRetry(record)).toBe(true);
    expect(shouldSuggestRetry(recordPractice(record, 7, "2026-12-01"))).toBe(false);
  });
});

describe("復習", () => {
  const mastered = recordPractice(recordPractice(emptyRecord(), 9, "2026-12-01"), 9, "2026-12-02");

  it("合格から3日後、1週間後、2週間後、1か月後に出す", () => {
    const dates = [];
    let record = mastered;
    for (let stage = 0; stage < 4; stage += 1) {
      dates.push(nextReviewDate(record));
      record = recordReview(record, 5);
    }
    expect(dates).toEqual(["2026-12-05", "2026-12-09", "2026-12-16", "2027-01-01"]);
    expect(courseStatus(record, "2027-02-01")).toBe("completed");
  });

  it("時期が来たら復習を出す", () => {
    expect(courseStatus(mastered, "2026-12-04")).toBe("mastered");
    expect(courseStatus(mastered, "2026-12-05")).toBe("review-due");
  });

  it("復習で合格しなかったら練習にもどし、練習で合格したら最初からやり直す", () => {
    const failed = recordReview(mastered, 3);
    expect(courseStatus(failed, "2026-12-05")).toBe("reviewing");
    const passed = recordPractice(failed, 9, "2026-12-06");
    expect(passed.reviewing).toBe(false);
    expect(nextReviewDate(passed)).toBe("2026-12-09");
  });
});

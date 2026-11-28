import { QUESTIONS_PER_REVIEW, QUESTIONS_PER_SESSION } from "./quiz";

export type CourseRecord = {
  passDates: string[];
  attempts: number;
  best: number;
  masteredOn: string | null;
  reviewStage: number;
  reviewing: boolean;
  lowStreak: number;
};

export type CourseStatus = "new" | "practicing" | "review-due" | "reviewing" | "mastered" | "completed";

// できたの基準：specs/mastery.md
const PASS_SCORE = 9;
const PASS_DAYS = 2;
const REVIEW_PASS_SCORE = 4;
const REVIEW_OFFSET_DAYS = [3, 7, 14, 30];
const LOW_SCORE = 6;
const LOW_STREAK_TO_SUGGEST = 2;

export function emptyRecord(): CourseRecord {
  return { passDates: [], attempts: 0, best: 0, masteredOn: null, reviewStage: 0, reviewing: false, lowStreak: 0 };
}

export function addDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function nextReviewDate(record: CourseRecord): string | null {
  if (!record.masteredOn || record.reviewing) return null;
  const offset = REVIEW_OFFSET_DAYS[record.reviewStage];
  return offset === undefined ? null : addDays(record.masteredOn, offset);
}

function restartReviews(record: CourseRecord, today: string): CourseRecord {
  return { ...record, masteredOn: today, reviewStage: 0, reviewing: false };
}

export function recordPractice(record: CourseRecord, score: number, today: string): CourseRecord {
  const passed = score >= PASS_SCORE && score <= QUESTIONS_PER_SESSION;
  const passDates = passed && !record.passDates.includes(today) ? [...record.passDates, today] : record.passDates;
  let next: CourseRecord = {
    ...record,
    passDates,
    attempts: record.attempts + 1,
    best: Math.max(record.best, score),
    lowStreak: score <= LOW_SCORE ? record.lowStreak + 1 : 0,
  };
  if (passed && record.reviewing) next = restartReviews(next, today);
  if (!next.masteredOn && passDates.length >= PASS_DAYS) next = restartReviews(next, today);
  return next;
}

export function recordReview(record: CourseRecord, score: number): CourseRecord {
  if (score > QUESTIONS_PER_REVIEW || score < REVIEW_PASS_SCORE) return { ...record, reviewing: true };
  return { ...record, reviewStage: record.reviewStage + 1 };
}

export function shouldSuggestRetry(record: CourseRecord): boolean {
  return record.lowStreak >= LOW_STREAK_TO_SUGGEST;
}

export function courseStatus(record: CourseRecord, today: string): CourseStatus {
  if (record.reviewing) return "reviewing";
  if (record.masteredOn) {
    const due = nextReviewDate(record);
    if (due === null) return "completed";
    return due <= today ? "review-due" : "mastered";
  }
  return record.attempts === 0 ? "new" : "practicing";
}

import { emptyRecord, type CourseRecord } from "./mastery";

export type Mistake = { word: string; type: "reading" | "writing"; chosen: string; answer: string; date: string };
export type SaveData = { version: 1; courses: Record<string, CourseRecord>; mistakes: Mistake[] };

const STORAGE_KEY = "studri.japanese.kanji-g3";
const MISTAKE_LIMIT = 50;

export function emptySave(): SaveData {
  return { version: 1, courses: {}, mistakes: [] };
}

// 古い形の記録を今の形に読み替える。今は version 1 だけ
export function migrate(value: unknown): SaveData {
  if (typeof value !== "object" || value === null) return emptySave();
  const data = value as Partial<SaveData>;
  if (data.version !== 1) return emptySave();
  const courses = Object.fromEntries(
    Object.entries(data.courses ?? {}).map(([id, record]) => [id, { ...emptyRecord(), ...record }]),
  );
  return { version: 1, courses, mistakes: Array.isArray(data.mistakes) ? data.mistakes : [] };
}

export function load(storage: Storage): SaveData {
  try {
    return migrate(JSON.parse(storage.getItem(STORAGE_KEY) ?? "null"));
  } catch {
    return emptySave();
  }
}

export function save(storage: Storage, data: SaveData): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // 保存できない環境では、記録を残さずに続ける
  }
}

export function addMistake(data: SaveData, mistake: Mistake): SaveData {
  return { ...data, mistakes: [mistake, ...data.mistakes].slice(0, MISTAKE_LIMIT) };
}

export function clearSave(storage: Storage): void {
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // 消せない環境では何もしない
  }
}

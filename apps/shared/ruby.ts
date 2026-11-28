import { kanjiByGrade } from "./kanji-grades";

const gradeOfKanji = new Map<string, number>(
  Object.entries(kanjiByGrade).flatMap(([grade, kanji]) => [...kanji].map((char) => [char, Number(grade)])),
);

export function isKanji(char: string): boolean {
  return /\p{Script=Han}/u.test(char);
}

// 配当学年。小学校で配当されない漢字は undefined
export function kanjiGrade(char: string): number | undefined {
  return gradeOfKanji.get(char);
}

// 表記の決まり：コースの学年とそれより後の学年の漢字、配当外の漢字にふりがなを付ける
export function needsRuby(char: string, courseGrade: number): boolean {
  if (!isKanji(char)) return false;
  const grade = kanjiGrade(char);
  return grade === undefined || grade >= courseGrade;
}

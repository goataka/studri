import type { Question } from "./quiz";

// 表記の決まりに合わせ、2年生までの字と仮名で書く
export const READING_HINT = "音読みかな、くん読みかな。おくりがなはあるかな。";

export type Hint = { text: string; choices?: string[] };

function readingHints(question: Question): Hint[] {
  const { otherWord } = question;
  return [{ text: READING_HINT }, { text: `同じ字をつかった ことば：${otherWord.text}（${otherWord.reading}）` }];
}

function writingHints(question: Question, random: () => number, tried: readonly string[]): Hint[] {
  const { otherWord, word } = question;
  const first =
    otherWord.targetReading !== word.targetReading
      ? `「${otherWord.reading}」の「${otherWord.targetReading}」とも読む字だよ。`
      : `「${otherWord.reading}」という ことばにも つかう字だよ。`;
  // まだ選んでいない誤りの選択肢を残し、もう一度考えられるようにする
  const wrong = question.choices.filter((choice) => choice !== question.answer && !tried.includes(choice));
  const kept = wrong[Math.floor(random() * wrong.length)];
  const choices = question.choices.filter((choice) => choice === question.answer || choice === kept);
  return [{ text: first }, { text: "答えは、この2つのどちらかだよ。", choices }];
}

// まちがえた回数ごとのヒント。1回目は言葉で問い直し、2回目は手がかりを見せる
export function hintsFor(question: Question, random: () => number, tried: readonly string[] = []): Hint[] {
  return question.type === "reading" ? readingHints(question) : writingHints(question, random, tried);
}

export type Segment = { text: string; reading: string; isTarget: boolean };
export type Word = { text: string; segments: Segment[]; reading: string; targetReading: string };
export type KanjiEntry = { kanji: string; words: Word[] };

const ROW = /^\| (\S) \| (\S+) \| (\S+) \| (\S+) \| (\S+) \|$/;

export function parseWord(text: string, readingField: string): Word {
  const parts = readingField.split("・");
  const chars = [...text];
  if (parts.length !== chars.length) throw new Error(`読みの区切りが字の数と合わない：${text}`);
  const segments = chars.map((char, index) => {
    const isTarget = parts[index].startsWith("[");
    return { text: char, reading: parts[index].replace(/[[\]]/g, ""), isTarget };
  });
  const target = segments.find((segment) => segment.isTarget);
  if (!target) throw new Error(`問う字の読みがない：${text}`);
  return { text, segments, reading: segments.map((segment) => segment.reading).join(""), targetReading: target.reading };
}

export function parseWords(markdown: string): KanjiEntry[] {
  return markdown
    .split("\n")
    .map((line) => ROW.exec(line))
    .filter((match): match is RegExpExecArray => match !== null)
    .map(([, kanji, word1, reading1, word2, reading2]) => ({
      kanji,
      words: [parseWord(word1, reading1), parseWord(word2, reading2)],
    }));
}


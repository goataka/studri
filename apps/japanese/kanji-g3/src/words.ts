import wordsPart1 from "../../../../specs/apps/kanji-g3/words-1.md?raw";
import wordsPart2 from "../../../../specs/apps/kanji-g3/words-2.md?raw";
import { parseWords, type KanjiEntry } from "./parse-words";

export { parseWord, parseWords, type KanjiEntry, type Segment, type Word } from "./parse-words";

export const kanjiEntries: readonly KanjiEntry[] = [...parseWords(wordsPart1), ...parseWords(wordsPart2)];

import { needsRuby } from "../../../shared/ruby";
import type { Word } from "./words";

export const COURSE_GRADE = 3;

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

type Mode = "mark-target" | "hide-target";

// 表記の決まり：問う字にはふりがなを付けず、それ以外の第3学年の字にはふりがなを付ける
export function renderWord(word: Word, mode: Mode): string {
  return word.segments
    .map((segment) => {
      const text = escapeHtml(segment.text);
      if (segment.isTarget) {
        return mode === "hide-target" ? '<span class="blank" role="img" aria-label="空いているところ"></span>' : `<span class="target">${text}</span>`;
      }
      if (!needsRuby(segment.text, COURSE_GRADE)) return text;
      return `<ruby>${text}<rt>${escapeHtml(segment.reading)}</rt></ruby>`;
    })
    .join("");
}

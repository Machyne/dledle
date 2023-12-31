import Graphemer from "graphemer";

const splitter = new Graphemer();

export function splitEmoji(str: string): Array<string> {
  return splitter.splitGraphemes(str).filter((c) => !/^\s+$/u.test(c));
}

export function splitEmojiLines(str: string): Array<Array<string>> {
  const lines = str.split(/\n/u);
  const splitLines = lines.map((line) => splitEmoji(line));
  return splitLines.filter((line) => line.length > 0);
}

export function emojiToRegexUnion(emoji: Array<string>) {
  return `(?:${emoji.join("|")})`;
}

export const cardinalArrowString = "⬆️➡️⬇️⬅️";
export const ordinalArrowString = cardinalArrowString + "↗️↘️↙️↖️";
export const cardinalArrows = splitEmoji(cardinalArrowString);
export const ordinalArrows = splitEmoji(ordinalArrowString);
export const ordinalArrowValues: Record<string, number> = Object.fromEntries(
  ordinalArrows.map((key, idx) => [key, idx]),
);
export const ordinalArrowRegex = emojiToRegexUnion(ordinalArrows);
export const arrows = {
  u: "⬆️" as const,
  r: "➡️" as const,
  d: "⬇️" as const,
  l: "⬅️" as const,
  ur: "↗️" as const,
  dr: "↘️" as const,
  dl: "↙️" as const,
  ul: "↖️" as const,
};

export const emojiSquares = {
  grey: "⬛" as const,
  lightGrey: "⬜" as const,
  yellow: "🟨" as const,
  green: "🟩" as const,
  red: "🟥" as const,
  purple: "🟪" as const,
};
export const greenYellowGrey = [emojiSquares.grey, emojiSquares.yellow, emojiSquares.green];
export const greenYellowGreyValues: Record<string, number> = {
  "⬛": 0,
  "⬜": 0,
  "🟨": 1,
  "🟩": 2,
};
export const fiveSquaresRegex = "(?:⬛|⬜|🟨|🟩){5}";

const numbers = "0️⃣1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣8️⃣9️⃣";
export const numberEmoji = splitEmoji(numbers);
export const numberEmojiRegex = emojiToRegexUnion(numberEmoji);
export const numberEmojiValues: Record<string, number> = Object.fromEntries(
  numberEmoji.map((key, idx) => [key, idx]),
);
export function emojiToNumber(emoji: Array<string>) {
  return emoji.reduce((sum, numEmoji) => 10 * sum + numberEmojiValues[numEmoji], 0);
}

export function numberToEmoji(number: number, padZeros = 0) {
  if (number === 0) {
    return numberEmoji[0].repeat(Math.max(padZeros, 1));
  }
  const result: Array<string> = [];
  while (number > 0) {
    result.push(numberEmoji[number % 10]);
    number = Math.floor(number / 10);
  }
  const numZeros = padZeros - result.length;
  if (numZeros > 0) {
    result.push(numberEmoji[0].repeat(numZeros));
  }
  return result.reverse().join("");
}

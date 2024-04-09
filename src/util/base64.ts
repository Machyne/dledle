import { DateParts } from "./dateHelpers";

// Feels like a good compromise between density and usability.
// 64^3 = 262,144 which is bigger than 3^10 = 59,049 or 101^2 = 10,201 so it can fit
// two rows of five 3-option guesses or two rows of 0-100 scores.
export const DEFAULT_WORD_WIDTH = 3;

// JS numbers are floats, with 52 bits of mantissa. This means we can represent ints with full precision up to 52 bits long (inclusive).
// This is plenty and it's easier to do it this way; no need to use BigInts.
// Math.floor(JS_MANTISSA_BITS / Math.log2(64)) = ⌊52/6⌋ = 8
const MAX_WORD_WIDTH = 8;

// From https://datatracker.ietf.org/doc/html/rfc4648#section-5
// Table 2: The "URL and Filename safe" Base 64 Alphabet
const B64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

const maxNumber = (wordWidth: number) => (1 << (6 * wordWidth)) - 1;

export function intToBase64(n: number, wordWidth = DEFAULT_WORD_WIDTH) {
  if (wordWidth > MAX_WORD_WIDTH) {
    throw new Error(`Word width ${wordWidth} is too large.`);
  }
  if (n < 0) {
    throw new Error(`${n} is negative.`);
  }
  if (n > maxNumber(wordWidth)) {
    throw new Error(`${n} is too large to fit in ${wordWidth} b64 characters.`);
  }

  let result = "";
  for (let i = 0; i < wordWidth; i++) {
    const b64Index = n % 64;
    n = Math.floor(n / 64);
    result = result + B64_ALPHABET[b64Index];
  }
  return result;
}

export function base64ToInt(s: string, wordWidth = DEFAULT_WORD_WIDTH) {
  if (wordWidth > MAX_WORD_WIDTH) {
    throw new Error(`Word width ${wordWidth} is too large.`);
  }
  if (s.length < wordWidth) {
    throw new Error(`${s} is not ${wordWidth} characters long.`);
  }
  let result = 0;
  for (let i = 0; i < wordWidth; i++) {
    var b64Index = B64_ALPHABET.indexOf(s[i]);
    if (b64Index === -1) {
      throw new Error(`${s[i]} is not a valid base64 character.`);
    }
    result += b64Index * 64 ** i;
  }
  return result;
}

export function nextInt(s: string, wordWidth = DEFAULT_WORD_WIDTH): [number, string] {
  if (s.length < wordWidth) {
    throw new Error(`${s} is not ${wordWidth} characters long.`);
  }
  const result = base64ToInt(s, wordWidth);
  return [result, s.slice(wordWidth)];
}

const startYear = 1990;
const maxYear = startYear + Math.floor(maxNumber(DEFAULT_WORD_WIDTH) / (31 * 12)) - 1;

export function datePartsToBase64(d: DateParts) {
  if (d.year < startYear || d.year > maxYear) {
    throw new Error(`Invalid year: ${d.year}`);
  }
  return intToBase64((d.year - startYear) * 31 * 12 + (d.month - 1) * 31 + (d.day - 1));
}

export function base64ToDateParts(s: string): DateParts {
  let intResult = base64ToInt(s);
  const day = (intResult % 31) + 1;
  intResult = Math.floor(intResult / 31);
  const month = (intResult % 12) + 1;
  intResult = Math.floor(intResult / 12);
  const year = intResult + startYear;
  return { year, month, day };
}

export function nextDateParts(s: string): [DateParts, string] {
  if (s.length < DEFAULT_WORD_WIDTH) {
    throw new Error(`${s} is not ${DEFAULT_WORD_WIDTH} characters long.`);
  }
  const result = base64ToDateParts(s);
  return [result, s.slice(DEFAULT_WORD_WIDTH)];
}

const shortStartYear = 2022;
// This gives a max of 2064
const shortMaxYear =
  shortStartYear + Math.floor(maxNumber(DEFAULT_WORD_WIDTH) / 16 / (31 * 12)) - 1;

export function shortDateToBase64(d: DateParts, extra4Bits: number) {
  if (d.year < shortStartYear || d.year > shortMaxYear) {
    throw new Error(`Invalid year: ${d.year}`);
  }
  if (extra4Bits < 0 || extra4Bits > 15) {
    throw new Error(`Invalid extra 4 bits: ${extra4Bits}`);
  }
  const dateNum = (d.year - shortStartYear) * 31 * 12 + (d.month - 1) * 31 + (d.day - 1);
  return intToBase64(dateNum * 16 + extra4Bits, DEFAULT_WORD_WIDTH);
}

export function base64ToShortDate(s: string): [DateParts, number] {
  let intResult = base64ToInt(s);
  const extra4Bits = intResult % 16;
  intResult = Math.floor(intResult / 16);
  const day = (intResult % 31) + 1;
  intResult = Math.floor(intResult / 31);
  const month = (intResult % 12) + 1;
  intResult = Math.floor(intResult / 12);
  const year = intResult + shortStartYear;
  return [{ year, month, day }, extra4Bits];
}

export function nextShortDate(s: string): [DateParts, string, number] {
  if (s.length < DEFAULT_WORD_WIDTH) {
    throw new Error(`${s} is not ${DEFAULT_WORD_WIDTH} characters long.`);
  }
  const result = base64ToShortDate(s);
  return [result[0], s.slice(DEFAULT_WORD_WIDTH), result[1]];
}

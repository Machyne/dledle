import { DEFAULT_WORD_WIDTH, intToBase64, nextInt } from "./base64";
import { emojiSquares } from "./emoji";

export function emojiSquareScaleToNumber(guessChars: Array<string>) {
  let result = 0;
  if (guessChars.length < 5) {
    throw new Error(`Invalid guess: ${guessChars}`);
  }
  for (const guessChar of guessChars) {
    if (guessChar === emojiSquares.green) {
      result += 2;
    } else if (guessChar === emojiSquares.yellow) {
      result += 1;
    }
  }
  return result;
}

export function numberToEmojiSquareScale(num: number, padChar: string = emojiSquares.black) {
  if (num < 0 || num > 10) {
    throw new Error(`Invalid number: ${num}`);
  }
  const numGreen = Math.floor(num / 2);
  const numYellow = num % 2;
  return (
    emojiSquares.green.repeat(numGreen) +
    emojiSquares.yellow.repeat(numYellow) +
    padChar.repeat(5 - (numGreen + numYellow))
  );
}

export function encodeEmoji(emoji: Array<string>, values: Record<string, number>): number {
  const base = Math.max(...Object.values(values)) + 1;
  return emoji.reduce((sum, numEmoji, idx) => sum + values[numEmoji] * base ** idx, 0);
}

export function decodeEmoji(
  encoded: number,
  lookup: Array<string>,
  length: number = -1,
): Array<string> {
  const base = lookup.length;
  const ret: Array<string> = [];
  while (encoded > 0) {
    ret.push(lookup[encoded % base]);
    encoded = Math.floor(encoded / base);
  }
  if (length > 0) {
    if (ret.length > length) {
      throw new Error(`Encoded emoji too long: ${ret}`);
    }
    while (ret.length < length) {
      ret.push(lookup[0]);
    }
  }
  return ret;
}

export function emojiRowsToB64(args: {
  emojiLines: Array<Array<string>>;
  values: Record<string, number>;
  rowsPerB64Word: number;
  b64WordWidth?: number;
}): string {
  const rows = args.emojiLines;
  if (!rows.length) {
    return "";
  }
  const base = Math.max(...Object.values(args.values)) + 1;
  const b64WordWidth = args.b64WordWidth ?? DEFAULT_WORD_WIDTH;
  const rowOffset = base ** rows[0].length;

  if (args.rowsPerB64Word * rowOffset ** args.rowsPerB64Word > 64 ** b64WordWidth) {
    throw new Error(
      `Cannot encode ${args.rowsPerB64Word} rows of ${rows[0].length} emoji (base ${base}) into ${b64WordWidth} b64 chars`,
    );
  }
  let encodedStr = "";
  let currentCode = 0;
  for (let rowIdx = 0; rowIdx < rows.length; ++rowIdx) {
    const positionInRow = rowIdx % args.rowsPerB64Word;
    const isRowEnd = positionInRow === args.rowsPerB64Word - 1;
    const row = rows[rowIdx];
    const rowValue = encodeEmoji(row, args.values);
    currentCode += rowValue * rowOffset ** positionInRow;
    if (isRowEnd || rowIdx === rows.length - 1) {
      // Encode the number of rows in this block.
      currentCode = currentCode * args.rowsPerB64Word + positionInRow;
      encodedStr += intToBase64(currentCode, b64WordWidth);
      currentCode = 0;
    }
  }
  return encodedStr;
}

export function b64ToEmojiRows(args: {
  serializedResult: string;
  lookup: Array<string>;
  rowLength: number;
  rowsPerB64Word: number;
  b64WordWidth?: number;
}): { rows: Array<string>; serializedResult: string } {
  const b64WordWidth = args.b64WordWidth ?? DEFAULT_WORD_WIDTH;
  const base = args.lookup.length;
  const rowOffset = base ** args.rowLength;

  const rows: string[] = [];
  let intResult: number;
  let serializedResult = args.serializedResult;
  while (serializedResult.length > 0) {
    [intResult, serializedResult] = nextInt(serializedResult, b64WordWidth);
    const numRows = (intResult % args.rowsPerB64Word) + 1;
    intResult = Math.floor(intResult / args.rowsPerB64Word);
    for (let rowIdx = 0; rowIdx < numRows; ++rowIdx) {
      rows.push(decodeEmoji(intResult % rowOffset, args.lookup, args.rowLength).join(""));
      intResult = Math.floor(intResult / rowOffset);
    }
  }
  return { rows, serializedResult };
}

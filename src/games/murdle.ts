import { BaseGame, GameScore } from "../baseGame";
import {
  DEFAULT_WORD_WIDTH,
  datePartsToBase64,
  intToBase64,
  nextDateParts,
  nextInt,
} from "../util/base64";
import { DateParts, ymd } from "../util/dateHelpers";
import { emojiToNumber, numberEmojiRegex, numberToEmoji, splitEmoji } from "../util/emoji";

const preWinEmoji = "⚖️";
const winEmoji = "👤";
const greenCheck = "✅";
const redX = "❌";
const bigSpace = " ".repeat(5);
const guessHeaderShort = "👤🔪🏡";
const guessHeaderOptional = "❓";
const guessHeaderSuffix = "🕰️";
const maxGuesses = 8; // Future proof this since we need extra storage anyway.

export class Murdle extends BaseGame {
  get name(): string {
    return "Murdle";
  }

  get link(): string {
    return "https://murdle.com/";
  }

  _buildResultRegex(): RegExp {
    const dateLine = "Murdle for ([0-9]{1,2}/[0-9]{1,2}/[0-9]{4})";
    const timeRegex = `(${numberEmojiRegex}{1,2}:${numberEmojiRegex}{2})`;
    const guessHeaderLine = `${guessHeaderShort}(?:${guessHeaderOptional})?\\s+${guessHeaderSuffix}`;
    const guessLine = `((?:${greenCheck}|${redX}){3,4})\\s+${timeRegex}`;
    const footer = `${preWinEmoji}\\s+(?:${winEmoji}|${redX})`;

    return new RegExp([dateLine, guessHeaderLine, guessLine, footer].join("\\s+"), "u");
  }

  serializeResult(gameResult: RegExpMatchArray) {
    const [, date, guessesBlock, timeBlock] = gameResult;
    const splitDate = date.split("/").map((s) => parseInt(s));
    const dateParts = ymd(splitDate[2], splitDate[0], splitDate[1]);
    const guesses = splitEmoji(guessesBlock);
    const timeParts = splitEmoji(timeBlock);

    // First encode the game date.
    let encoded = datePartsToBase64(dateParts);

    const minutes = emojiToNumber(timeParts.slice(0, timeParts.length - 3));
    const seconds = emojiToNumber(timeParts.slice(timeParts.length - 2));

    // Murdle was released without support for a fourth "Motive" dimension.
    // Branch on encoding that to be backwards compatible since we need two more bits of info
    // and that doesn't fit into the old method anyway.
    if (guesses.length === 3) {
      // In this case, each game is 3 x 1-bit guesses plus a minutes/seconds count.
      // 60 seconds * 60 minutes * 16 < 64^3, so this fits in our 3 b64 characters.
      const guessBits = guesses.reduce(
        (sum, guess, idx) => sum + (guess === greenCheck ? 1 << idx : 0),
        0,
      );
      encoded += intToBase64(guessBits + seconds * 8 + minutes * 60 * 8);
    } else {
      if (guesses.length > maxGuesses) {
        throw new Error(`Too many guesses: ${guesses}`);
      }
      // Otherwise each game is 4 x 1-bit guesses plus minutes/seconds.
      // Combining these doesn't get us anywhere.
      encoded += intToBase64(minutes, 1);
      encoded += intToBase64(seconds, 1);
      const guessBits = guesses.reduce(
        (sum, guess, idx) => sum + (guess === greenCheck ? 1 << idx : 0),
        0,
      );
      // 3bit length + up to 8bit guesses = 11 bits, so we can fit this in 2 b64 characters.
      encoded += intToBase64(guessBits * maxGuesses + guesses.length, 2);
    }

    const numCorrect = guesses.filter((guess) => guess === greenCheck).length;
    const score =
      numCorrect === guesses.length
        ? GameScore.Win
        : numCorrect === guesses.length - 1
          ? GameScore.NearWin
          : GameScore.Loss;
    return { score, serializedResult: encoded };
  }

  deserialize(serializedResult: string) {
    if (
      serializedResult.length !== DEFAULT_WORD_WIDTH * 2 &&
      serializedResult.length !== DEFAULT_WORD_WIDTH + 4
    ) {
      throw new Error(`Invalid Murdle result: ${serializedResult}`);
    }
    let intResult: number;
    let date: DateParts;
    [date, serializedResult] = nextDateParts(serializedResult);
    const parseGuessBits = (guessBits: number, numGuesses: number) => {
      const guesses: Array<string> = [];
      for (let idx = 0; idx < numGuesses; ++idx) {
        const isCorrect = guessBits & (1 << idx);
        guesses.push(isCorrect ? greenCheck : redX);
      }
      return guesses;
    };
    let minutes: number;
    let seconds: number;
    let guesses: Array<string>;
    if (serializedResult.length === DEFAULT_WORD_WIDTH) {
      [intResult, serializedResult] = nextInt(serializedResult);
      const guessBits = intResult % 8;
      intResult = Math.floor(intResult / 8);
      seconds = intResult % 60;
      minutes = Math.floor(intResult / 60);
      guesses = parseGuessBits(guessBits, 3);
    } else {
      [minutes, serializedResult] = nextInt(serializedResult, 1);
      [seconds, serializedResult] = nextInt(serializedResult, 1);
      [intResult, serializedResult] = nextInt(serializedResult, 2);
      const numGuesses = intResult % maxGuesses;
      const guessBits = Math.floor(intResult / maxGuesses);
      guesses = parseGuessBits(guessBits, numGuesses);
    }

    const isWin = guesses.every((guess) => guess === greenCheck);
    const timeStr = `${numberToEmoji(minutes)}:${numberToEmoji(seconds, 2)}`;
    const guessHeaderLine =
      guessHeaderShort +
      (guesses.length === 3 ? "" : guessHeaderOptional) +
      bigSpace +
      guessHeaderSuffix;
    return `Murdle for ${date.month}/${date.day}/${date.year}\n\n${guessHeaderLine}\n${guesses.join(
      "",
    )}${bigSpace}${timeStr}\n\n${preWinEmoji}\n${isWin ? winEmoji : redX}`;
  }
}

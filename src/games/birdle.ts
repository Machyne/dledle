import { BaseGame, GameScore } from "../baseGame";
import {
  DEFAULT_WORD_WIDTH,
  intToBase64,
  nextInt,
  nextShortDate,
  shortDateToBase64,
} from "../util/base64";
import { DateParts, ymd, zeroPadDate } from "../util/dateHelpers";
import { emojiToRegexUnion, splitEmojiLines } from "../util/emoji";

const maxGuesses = 6;
const birdsPerRow = 4;
const yesEmoji = "🐦";
const noEmoji = "❌";

export class Birdle extends BaseGame {
  get name(): string {
    return "Birdle";
  }

  get link(): string {
    return "https://www.play-birdle.com/";
  }

  _buildResultRegex(): RegExp {
    const datePart = "(\\d{4}-\\d{2}-\\d{2})";
    const fourEmoji = emojiToRegexUnion([yesEmoji, noEmoji]) + `{${birdsPerRow}}`;
    return new RegExp(
      `World Birdle\\s+${datePart}\\s+((?:${fourEmoji}(?:\\*?)\\s*){1,${maxGuesses}})`,
      "u",
    );
  }

  serializeResult(gameResult: RegExpMatchArray) {
    const [, date, guessesBlock] = gameResult;
    const [yyyy, mm, dd] = date.split("-");
    const dateParts = ymd(parseInt(yyyy), parseInt(mm), parseInt(dd));

    // Each guess is 0-4 yes emoji padded with no emoji plus an optional star.
    // We handle wins specially since they are always the last guess, so we can
    // ignore the 4 birds case, so we only need 2 bird bits + 1 star bit.
    // This is 6 * 3bits = 18 bits so it fits in 3 base64 characters.
    const guesses = splitEmojiLines(guessesBlock);
    if (guesses.length > maxGuesses) {
      throw new Error(`Too many guesses: ${guesses.length}`);
    }
    let guessEncoding = 0;
    let allButOneBird = false;
    let winIdx = 0;
    for (let guessIdx = 0; guessIdx < guesses.length; ++guessIdx) {
      const guessRow = guesses[guessIdx];
      let numBirds = guessRow.filter((emoji) => emoji === yesEmoji).length;
      if (numBirds === birdsPerRow - 1) {
        allButOneBird = true;
      } else if (numBirds === birdsPerRow) {
        winIdx = guessIdx + 1;
        if (guessIdx !== guesses.length - 1) {
          throw new Error(`Winning guess not last: ${guessIdx}`);
        }
        // Ignore the 4 birds case.
        numBirds = 0;
      }
      const hasStar = guessRow.includes("*") ? 1 : 0;
      guessEncoding += (numBirds * 2 + hasStar) << (guessIdx * 3);
    }

    const serializedResult = shortDateToBase64(dateParts, winIdx) + intToBase64(guessEncoding, 3);
    const score = winIdx !== 0 ? GameScore.Win : allButOneBird ? GameScore.NearWin : GameScore.Loss;
    return { score, serializedResult };
  }

  deserialize(serializedResult: string) {
    if (serializedResult.length !== DEFAULT_WORD_WIDTH * 2) {
      throw new Error(`Invalid Birdle result: ${serializedResult}`);
    }
    // Start with the date.
    let date: DateParts;
    let winIdx: number;
    [date, serializedResult, winIdx] = nextShortDate(serializedResult);
    // Then decode the guess rows.
    let intResult: number;
    [intResult, serializedResult] = nextInt(serializedResult);
    const guesses: string[] = [];
    for (let guessIdx = 0; guessIdx < maxGuesses; ++guessIdx) {
      const guessRow = (intResult >> (guessIdx * 3)) & 0b111;
      let numBirds = guessRow >> 1;
      // Special case handling for the winning guess.
      if (guessIdx + 1 === winIdx) {
        numBirds = birdsPerRow;
      }
      const hasStar = guessRow & 1;
      guesses.push(
        yesEmoji.repeat(numBirds) + noEmoji.repeat(birdsPerRow - numBirds) + "*".repeat(hasStar),
      );
      if (numBirds === birdsPerRow) {
        break;
      }
    }
    const { yyyy, mm, dd } = zeroPadDate(date);
    return `World Birdle\n${yyyy}-${mm}-${dd}\n${guesses.join("\n")}`;
  }
}

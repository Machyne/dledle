import { BaseGame, GameScore } from "../baseGame";
import {
  DEFAULT_WORD_WIDTH,
  datePartsToBase64,
  intToBase64,
  nextDateParts,
  nextInt,
} from "../util/base64";
import { DateParts, dateFromStrings, zeroPadDate } from "../util/dateHelpers";
import {
  emojiToRegexUnion,
  fiveSquaresRegex,
  ordinalArrowValues,
  ordinalArrows,
  splitEmojiLines,
} from "../util/emoji";
import { emojiSquareScaleToNumber, numberToEmojiSquareScale } from "../util/gameHelpers";

const winEmoji = "🎉";
const arrowsOrWin = [...ordinalArrows, winEmoji];
const arrowOrWinValues: Record<string, number> = {
  ...ordinalArrowValues,
  "🎉": ordinalArrows.length,
};

export class Worldle extends BaseGame {
  get name(): string {
    return "Worldle";
  }

  get link(): string {
    return "https://worldle.teuteuf.fr/";
  }

  _buildResultRegex(): RegExp {
    const guessStr = fiveSquaresRegex + emojiToRegexUnion(arrowsOrWin);
    const optionalDatePart = "(\\(\\d{2}.\\d{2}.\\d{4}\\) )?";
    const percentPart = "\\((\\d{1,3}%)\\)";
    const introLine = `#Worldle #(\\d+) ${optionalDatePart}([1-6X])/6 ${percentPart}`;
    return new RegExp(`${introLine}\\s+((?:${guessStr}\\s*){1,6})`, "u");
  }

  serializeResult(gameResult: RegExpMatchArray) {
    const [, gameNumber, optionalDate, numGuessesStr, percentStr, guessesBlock] = gameResult;
    const isWin = numGuessesStr !== "X";

    // First encode the game number, num guesses, and percent score.
    let percent = parseInt(percentStr);
    // Date is a new addition, encode it as a score greater than 100.
    if (optionalDate) {
      percent += 101;
    }
    let encoded = intToBase64(parseInt(gameNumber));
    const numGuesses = isWin ? parseInt(numGuessesStr) : 6;
    encoded += intToBase64(percent * 12 + (numGuesses - 1) * 2 + (isWin ? 1 : 0));
    if (optionalDate) {
      const datePartStrs = optionalDate.match(/(\d+)/g);
      if (!datePartStrs || datePartStrs.length !== 3) {
        throw new Error(`Invalid date: ${optionalDate} - ${datePartStrs}`);
      }
      encoded += datePartsToBase64(
        dateFromStrings({
          day: datePartStrs[0],
          month: datePartStrs[1],
          year: datePartStrs[2],
        }),
      );
    }
    const guesses = splitEmojiLines(guessesBlock);
    if (guesses.length !== numGuesses) {
      throw new Error(`Expected ${numGuesses} guesses, got ${guesses.length}`);
    }
    // Each guess is a closeness value (0-10) and a direction (0-8). We can fit two of these into
    // 3 base64 chars, since (11*9)^2 < 64^3.
    let guessEncoding = 0;
    for (let guessIdx = 0; guessIdx < guesses.length; ++guessIdx) {
      const guessChars = guesses[guessIdx];
      const closeness = emojiSquareScaleToNumber(guessChars);
      const direction = arrowOrWinValues[guessChars[5]];
      let rowEncoding = closeness * 9 + direction;
      if (guessIdx % 2 === 1) {
        rowEncoding *= 11 * 9;
      }
      guessEncoding += rowEncoding;

      // Write the encoding every other row, or at the end.
      if (guessIdx % 2 === 1 || guessIdx === guesses.length - 1) {
        encoded += intToBase64(guessEncoding);
        guessEncoding = 0;
      }
    }
    const score = isWin ? GameScore.Win : percent >= 90 ? GameScore.NearWin : GameScore.Loss;
    return { score, serializedResult: encoded };
  }

  deserialize(serializedResult: string) {
    if (
      serializedResult.length % DEFAULT_WORD_WIDTH !== 0 ||
      serializedResult.length < DEFAULT_WORD_WIDTH * 3
    ) {
      throw new Error(`Invalid Worldle result: ${serializedResult}`);
    }
    // Start with the metadata.
    let intResult: number;
    [intResult, serializedResult] = nextInt(serializedResult);
    const gameNumber = intResult;
    [intResult, serializedResult] = nextInt(serializedResult);
    const isWin = intResult % 2;
    intResult = Math.floor(intResult / 2);
    const numGuesses = (intResult % 6) + 1;
    intResult = Math.floor(intResult / 6);
    let percent = intResult;

    let date: DateParts | null = null;
    if (percent > 100) {
      percent -= 101;
      [date, serializedResult] = nextDateParts(serializedResult);
    }

    // Then decode the guess rows.
    const guesses: string[] = [];
    while (serializedResult.length > 0) {
      [intResult, serializedResult] = nextInt(serializedResult);
      const firstGuess = intResult % (11 * 9);
      const secondGuess = Math.floor(intResult / (11 * 9));
      const makeGuess = (guess: number) => {
        const direction = guess % 9;
        const closeness = Math.floor(guess / 9);
        return numberToEmojiSquareScale(closeness) + arrowsOrWin[direction];
      };
      guesses.push(makeGuess(firstGuess));
      const hasSecondGuess = numGuesses > guesses.length;
      if (hasSecondGuess) {
        guesses.push(makeGuess(secondGuess));
      }
    }
    const ds = date ? zeroPadDate(date) : null;
    return `#Worldle #${gameNumber} ${ds ? `(${ds.dd}.${ds.mm}.${ds.yyyy}) ` : ""}${
      isWin ? numGuesses : "X"
    }/6 (${percent}%)\n${guesses.join("\n")}`;
  }
}

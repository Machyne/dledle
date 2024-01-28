import { BaseGame, GameScore } from "../baseGame";
import {
  DEFAULT_WORD_WIDTH,
  datePartsToBase64,
  intToBase64,
  nextDateParts,
  nextInt,
} from "../util/base64";
import { DateParts, date224Re, dateFromStrings } from "../util/dateHelpers";
import { emojiSquares, emojiToRegexUnion, splitEmoji } from "../util/emoji";

const prefixEmoji = "🕹️";
const maxGuesses = 6;

export class Gamedle extends BaseGame {
  get name(): string {
    return "Gamedle";
  }

  get link(): string {
    return "https://www.gamedle.wtf/classic";
  }

  _buildResultRegex(): RegExp {
    const squareRegex = emojiToRegexUnion([
      emojiSquares.red,
      emojiSquares.green,
      emojiSquares.white,
    ]);

    return new RegExp(
      `${prefixEmoji} Gamedle: (${date224Re})\\s+(${squareRegex}{${maxGuesses}})`,
      "u",
    );
  }

  serializeResult(gameResult: RegExpMatchArray) {
    const [, dateString, guessLine] = gameResult;
    const winIdx = splitEmoji(guessLine).indexOf(emojiSquares.green);
    const wrongGuesses = winIdx === -1 ? maxGuesses : winIdx;
    const [dd, mm, yyyy] = dateString.split("/");
    const date = dateFromStrings({
      day: dd,
      month: mm,
      year: yyyy,
    });
    let serializedResult = datePartsToBase64(date);
    serializedResult += intToBase64(wrongGuesses, 1);
    return { score: winIdx === -1 ? GameScore.Loss : GameScore.Win, serializedResult };
  }

  deserialize(serializedResult: string) {
    if (serializedResult.length !== 1 + DEFAULT_WORD_WIDTH) {
      throw new Error(`Invalid Gamedle result: ${serializedResult}`);
    }
    let date: DateParts;
    let wrongGuesses: number;
    [date, serializedResult] = nextDateParts(serializedResult);
    [wrongGuesses, serializedResult] = nextInt(serializedResult, 1);
    let emoji = emojiSquares.red.repeat(wrongGuesses);
    if (wrongGuesses < maxGuesses) {
      emoji += emojiSquares.green;
      emoji += emojiSquares.white.repeat(maxGuesses - wrongGuesses - 1);
    }
    return `${prefixEmoji} Gamedle: ${date.day.toString().padStart(2, "0")}/${date.month
      .toString()
      .padStart(2, "0")}/${date.year} ${emoji}`;
  }
}

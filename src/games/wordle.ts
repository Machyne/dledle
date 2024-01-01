import { BaseGame, GameScore } from "../baseGame";
import { DEFAULT_WORD_WIDTH, intToBase64, nextInt } from "../util/base64";
import {
  emojiSquares,
  fiveSquaresRegex,
  greenYellowGrey,
  greenYellowGreyValues,
  splitEmojiLines,
} from "../util/emoji";
import { b64ToEmojiRows, emojiRowsToB64 } from "../util/gameHelpers";

const rowsPerB64Word = 2;

export class Wordle extends BaseGame {
  get name(): string {
    return "Wordle";
  }

  get link(): string {
    return "https://www.nytimes.com/games/wordle/index.html";
  }

  _buildResultRegex(): RegExp {
    return new RegExp(
      `Wordle (\\d+) ([1-6X])\\/6(\\*?)\\s+((?:${fiveSquaresRegex}\\s*){1,6})`,
      "u",
    );
  }

  serializeResult(gameResult: RegExpMatchArray) {
    const [, gameNumber, gameScore, hasStar, guessesBlock] = gameResult;
    const isWin = gameScore !== "X";
    const numGuesses = isWin ? parseInt(gameScore) : 6;
    // First encode the game number, win-or-not, and star-or-not.
    let encoded = intToBase64(4 * parseInt(gameNumber) + (hasStar ? 2 : 0) + (isWin ? 1 : 0));
    // Next encode the guesses.
    const guesses = splitEmojiLines(guessesBlock);
    if (guesses.length !== numGuesses) {
      throw new Error(`Invalid number of guesses: ${guesses.length}`);
    }
    encoded += emojiRowsToB64({
      emojiLines: guesses,
      values: greenYellowGreyValues,
      rowsPerB64Word,
    });
    const score = isWin
      ? GameScore.Win
      : guesses.some((row) => row.filter((char) => char === emojiSquares.green).length == 4)
        ? GameScore.NearWin
        : GameScore.Loss;
    return { score, serializedResult: encoded };
  }

  deserialize(serializedResult: string) {
    if (
      serializedResult.length % DEFAULT_WORD_WIDTH !== 0 ||
      serializedResult.length < DEFAULT_WORD_WIDTH * 2
    ) {
      throw new Error(`Invalid Wordle result: ${serializedResult}`);
    }
    let intResult: number;
    [intResult, serializedResult] = nextInt(serializedResult);
    const isWin = intResult & 1;
    const hasStar = intResult & 2;
    const gameNumber = Math.floor(intResult / 4);

    const { rows: guesses, serializedResult: sr } = b64ToEmojiRows({
      serializedResult,
      lookup: greenYellowGrey,
      rowLength: 5,
      rowsPerB64Word,
    });
    serializedResult = sr;
    return `Wordle ${gameNumber} ${isWin ? guesses.length.toString() : "X"}/6${
      hasStar ? "*" : ""
    }\n\n${guesses.join("\n")}`;
  }
}

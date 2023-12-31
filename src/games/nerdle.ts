import { BaseGame, GameScore } from "../baseGame";
import { DEFAULT_WORD_WIDTH, intToBase64, nextInt } from "../util/base64";
import { emojiSquares, emojiToRegexUnion, splitEmojiLines } from "../util/emoji";
import { b64ToEmojiRows, emojiRowsToB64 } from "../util/gameHelpers";

const rowsPerB64Word = 2;
const b64WordWidth = 5;

const squareValues = {
  [emojiSquares.grey]: 0,
  [emojiSquares.lightGrey]: 0,
  [emojiSquares.purple]: 1,
  [emojiSquares.green]: 2,
};
const squareList = [emojiSquares.grey, emojiSquares.purple, emojiSquares.green];

export class Nerdle extends BaseGame {
  get name(): string {
    return "Nerdle";
  }

  get link(): string {
    return "https://www.nytimes.com/games/wordle/index.html";
  }

  _buildResultRegex(): RegExp {
    return new RegExp(
      `nerdlegame (\\d+) ([1-6X])\\/6\\s+((?:${emojiToRegexUnion(squareList)}{8}\\s+){1,6})`,
      "u",
    );
  }

  serializeResult(gameResult: RegExpMatchArray) {
    const [, gameNumber, gameScore, guessesBlock] = gameResult;
    const isWin = gameScore !== "X";
    // First encode the game number, win-or-not, and star-or-not.
    let encoded = intToBase64(2 * parseInt(gameNumber) + (isWin ? 1 : 0));
    // Next encode the guesses.
    const guesses = splitEmojiLines(guessesBlock);
    encoded += emojiRowsToB64({
      emojiLines: guesses,
      values: squareValues,
      rowsPerB64Word,
      b64WordWidth,
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
      serializedResult.length < DEFAULT_WORD_WIDTH + b64WordWidth ||
      (serializedResult.length - DEFAULT_WORD_WIDTH) % b64WordWidth !== 0
    ) {
      throw new Error(`Invalid Nerdle result: ${serializedResult}`);
    }
    let intResult: number;
    [intResult, serializedResult] = nextInt(serializedResult);
    const isWin = intResult & 1;
    const gameNumber = Math.floor(intResult / 2);

    const { rows: guesses, serializedResult: sr } = b64ToEmojiRows({
      serializedResult,
      lookup: squareList,
      rowLength: 8,
      rowsPerB64Word,
      b64WordWidth,
    });
    serializedResult = sr;
    return `nerdlegame ${gameNumber} ${isWin ? guesses.length.toString() : "X"}/6\n\n${guesses.join(
      "\n",
    )}`;
  }
}

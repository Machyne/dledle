import { BaseGame, GameScore } from "../baseGame";
import { DEFAULT_WORD_WIDTH } from "../util/base64";
import { emojiSquares, emojiToRegexUnion, listToValueMap, splitEmojiLines } from "../util/emoji";
import { b64ToEmojiRows, emojiRowsToB64 } from "../util/gameHelpers";

const rowsPerB64Word = 2;
const correctHint = "🐸";
const hintEmoji = [emojiSquares.black, "🐱", correctHint];
const hintEmojiValues = listToValueMap(hintEmoji);

export class Factle extends BaseGame {
  get name(): string {
    return "Factle";
  }

  get link(): string {
    return "https://factle.app/";
  }

  _buildResultRegex(): RegExp {
    const fiveHints = emojiToRegexUnion(hintEmoji) + "{5}";
    return new RegExp(
      `Factle.app #2 ([1-5])/5.*\\s+(?:\\w.*\\s+)?((?:${fiveHints}\\s*){1,5})`,
      "u",
    );
  }

  serializeResult(gameResult: RegExpMatchArray) {
    const [, gameScore, guessesBlock] = gameResult;
    const numRows = parseInt(gameScore);
    // Next encode the guesses.
    const guesses = splitEmojiLines(guessesBlock);
    if (guesses.length !== numRows) {
      throw new Error(`Invalid number of guesses: ${guesses.length}`);
    }
    const encoded = emojiRowsToB64({
      emojiLines: guesses,
      values: hintEmojiValues,
      rowsPerB64Word,
    });
    // If the last row is all correct, it's a win.
    // If any row has no wrong guesses or four right guesses, it's a near win.
    const score = guesses[guesses.length - 1].every((char) => char === correctHint)
      ? GameScore.Win
      : guesses.some(
            (row) =>
              row.every((char) => char !== emojiSquares.black) ||
              row.filter((char) => char === correctHint).length === row.length - 1,
          )
        ? GameScore.NearWin
        : GameScore.Loss;
    return { score, serializedResult: encoded };
  }

  deserialize(serializedResult: string) {
    if (serializedResult.length % DEFAULT_WORD_WIDTH !== 0) {
      throw new Error(`Invalid Factle result: ${serializedResult}`);
    }
    const { rows } = b64ToEmojiRows({
      serializedResult,
      lookup: hintEmoji,
      rowLength: 5,
      rowsPerB64Word,
    });
    return `Factle.app #2 ${rows.length}/5\n${rows.join("\n")}`;
  }
}

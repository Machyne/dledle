import { BaseGame, GameScore } from "../baseGame";
import { DEFAULT_WORD_WIDTH } from "../util/base64";
import { emojiToRegexUnion, listToValueMap, splitEmojiLines } from "../util/emoji";
import { b64ToEmojiRows, emojiRowsToB64 } from "../util/gameHelpers";

const rowsPerB64Word = 2;
const yesEmoji = "🟢";
const noEmoji = "⚫";
const hintEmoji = [noEmoji, "🟡", yesEmoji];
const hintEmojiValues = listToValueMap(hintEmoji);

export class Cloudle extends BaseGame {
  get name(): string {
    return "Cloudle";
  }

  get link(): string {
    return "https://factle.app/";
  }

  _buildResultRegex(): RegExp {
    const fiveHints = emojiToRegexUnion(hintEmoji) + "{5}";
    return new RegExp(`Cloudle.* ([1-6X])/6.*\\s+((?:${fiveHints}\\s*){1,6})`, "u");
  }

  serializeResult(gameResult: RegExpMatchArray) {
    const [, gameScore, guessesBlock] = gameResult;
    const isWin = gameScore !== "X";
    const wrongGuesses = isWin ? parseInt(gameScore) - 1 : 6;
    const numRows = isWin ? wrongGuesses + 1 : 6;
    const guesses = splitEmojiLines(guessesBlock);
    if (guesses.length !== numRows) {
      throw new Error(`Invalid number of guesses: ${guesses.length}`);
    }
    if (isWin && !guesses[guesses.length - 1].every((char) => char === yesEmoji)) {
      throw new Error(`Last row must be all correct for win: ${guesses[guesses.length - 1]}`);
    }
    const encoded = emojiRowsToB64({
      emojiLines: guesses,
      values: hintEmojiValues,
      rowsPerB64Word,
    });
    // If any row has no wrong guesses or four right guesses, it's a near win.
    const score = isWin
      ? GameScore.Win
      : guesses.some(
            (row) =>
              row.every((char) => char !== noEmoji) ||
              row.filter((char) => char === yesEmoji).length === row.length - 1,
          )
        ? GameScore.NearWin
        : GameScore.Loss;
    return { score, serializedResult: encoded };
  }

  deserialize(serializedResult: string) {
    if (serializedResult.length % DEFAULT_WORD_WIDTH !== 0) {
      throw new Error(`Invalid Cloudle result: ${serializedResult}`);
    }
    const { rows } = b64ToEmojiRows({
      serializedResult,
      lookup: hintEmoji,
      rowLength: 5,
      rowsPerB64Word,
    });
    const isWin = rows[rows.length - 1] === yesEmoji.repeat(5);
    return `Cloudle ${isWin ? rows.length.toString() : "X"}/6\n\n${rows.join("\n")}`;
  }
}

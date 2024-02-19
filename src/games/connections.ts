import { BaseGame, GameScore } from "../baseGame";
import { DEFAULT_WORD_WIDTH, intToBase64, nextInt } from "../util/base64";
import { emojiToRegexUnion, listToValueMap, splitEmojiLines } from "../util/emoji";
import { b64ToEmojiRows, emojiRowsToB64 } from "../util/gameHelpers";

const rowsPerB64Word = 2;
const categories = ["🟨", "🟩", "🟦", "🟪"];
const categoryValues = listToValueMap(categories);

export class Connections extends BaseGame {
  get name(): string {
    return "Connections";
  }

  get link(): string {
    return "https://www.nytimes.com/games/connections";
  }

  _buildResultRegex(): RegExp {
    const fourHints = emojiToRegexUnion(categories) + "{4}";
    return new RegExp(`Connections\\s*Puzzle #(\\d+)\\s*((?:${fourHints}\\s*){4,7})`, "u");
  }

  serializeResult(gameResult: RegExpMatchArray) {
    const [, gameNumber, guessesBlock] = gameResult;
    // Next encode the guesses.
    let encoded = "";
    encoded += intToBase64(parseInt(gameNumber), 2);
    const guesses = splitEmojiLines(guessesBlock);
    const winIndexes = categories.map((category) =>
      guesses.findIndex((row) => row.every((color) => color === category)),
    );
    // The guess lines is at most len 7, so elements of winIndexes range from -1 to 6.
    // Increment each index by 1 to shift to range 0 to 7, then encode as a 3-bit number.
    // Four 3-bit numbers can be encoded in two base64 characters.
    const winIndexesEncoding = winIndexes.reduce(
      (sum, winIndex, idx) => sum + (winIndex + 1) * (1 << (3 * idx)),
      0,
    );
    encoded += intToBase64(winIndexesEncoding, 2);

    const wrongGuesses = guesses.filter((_, idx) => !winIndexes.includes(idx));
    // Each square is one of four colors, so we can encode each row as 4 x 2-bit numbers.
    // Two of these 8bit rows + 1 bit row offset (17bits) can be encoded in 3 base64 characters (18bits).
    encoded += emojiRowsToB64({
      emojiLines: wrongGuesses,
      values: categoryValues,
      rowsPerB64Word,
    });
    // If all categories were found, then it's a win. If two were found and one had all but one square, it's a near win.
    const missedCategories = categories.filter((_, idx) => winIndexes[idx] === -1);
    const score =
      missedCategories.length === 0
        ? GameScore.Win
        : missedCategories.length == 2 &&
            wrongGuesses.some((row) =>
              missedCategories.some((miss) => row.filter((color) => color === miss).length === 3),
            )
          ? GameScore.NearWin
          : GameScore.Loss;
    return { score, serializedResult: encoded };
  }

  deserialize(serializedResult: string) {
    if (serializedResult.length < 4 || (serializedResult.length - 4) % DEFAULT_WORD_WIDTH !== 0) {
      throw new Error(`Invalid Connections result: ${serializedResult}`);
    }
    let intResult: number;
    [intResult, serializedResult] = nextInt(serializedResult, 2);
    const gameNumber = intResult;
    [intResult, serializedResult] = nextInt(serializedResult, 2);
    const winIndexes: Array<number> = [];
    for (let i = 0; i < 4; ++i) {
      const idx = (intResult >> (3 * i)) & 0b111;
      winIndexes.push(idx - 1);
    }
    const { rows } = b64ToEmojiRows({
      serializedResult,
      lookup: categories,
      rowLength: 4,
      rowsPerB64Word,
    });
    const winsInOrder = winIndexes
      .reduce(
        (acc, winIdx, idx) => {
          if (winIdx != -1) {
            acc.push([winIdx, categories[idx]]);
          }
          return acc;
        },
        [] as Array<[number, string]>,
      )
      // Sort ascending by win index so that we can insert the earlier rows first and
      // preserve placement for later indexes.
      .sort(([a], [b]) => a - b);
    for (const [winIdx, category] of winsInOrder) {
      rows.splice(winIdx, 0, category.repeat(4));
    }
    return `Connections\nPuzzle #${gameNumber}\n${rows.join("\n")}`;
  }
}

import { BaseGame, GameScore } from "../baseGame";
import { DEFAULT_WORD_WIDTH, intToBase64, nextInt } from "../util/base64";
import { emojiSquares, fiveSquaresRegex, splitEmojiLines } from "../util/emoji";
import { emojiSquareScaleToNumber, numberToEmojiSquareScale } from "../util/gameHelpers";

const guessEncodingWidth = 2;

export class Tradle extends BaseGame {
  get name(): string {
    return "Tradle";
  }

  get link(): string {
    return "https://oec.world/en/tradle";
  }

  _buildResultRegex(): RegExp {
    return new RegExp(`#Tradle #(\\d+) ([1-6X])\\/6\\s+((?:${fiveSquaresRegex}\\s*){1,6})`, "u");
  }

  serializeResult(gameResult: RegExpMatchArray) {
    const [, gameNumber, numGuessesStr, guessesBlock] = gameResult;
    const isWin = numGuessesStr !== "X";

    // First encode the game number amd num guesses.
    const numGuesses = isWin ? parseInt(numGuessesStr) : 6;
    let encoded = intToBase64(parseInt(gameNumber) * 7 + (isWin ? numGuesses - 1 : 6));
    const guesses = splitEmojiLines(guessesBlock);
    if (guesses.length !== numGuesses) {
      throw new Error(`Expected ${numGuesses} guesses, got ${guesses.length}`);
    }
    // Each guess is a closeness value (0-10). We can fit three of these into
    // 2 base64 chars, since 11^3 < 64^2.
    const numericRows = guesses.map(emojiSquareScaleToNumber);
    let guessEncoding = 0;
    for (let guessIdx = 0; guessIdx < numericRows.length; ++guessIdx) {
      const closeness = numericRows[guessIdx];
      // Encode three rows at a time.
      const pow = guessIdx % 3;
      guessEncoding += closeness * 11 ** pow;

      // Write the encoding every third row, or at the end.
      if (pow === 2 || guessIdx === guesses.length - 1) {
        encoded += intToBase64(guessEncoding, guessEncodingWidth);
        guessEncoding = 0;
      }
    }
    const score = isWin
      ? GameScore.Win
      : numericRows.some((val) => val >= 9)
        ? GameScore.NearWin
        : GameScore.Loss;
    return { score, serializedResult: encoded };
  }

  deserialize(serializedResult: string) {
    if (
      // Metadata plus one or two three-guess blocks.
      ![
        DEFAULT_WORD_WIDTH + guessEncodingWidth,
        DEFAULT_WORD_WIDTH + 2 * guessEncodingWidth,
      ].includes(serializedResult.length)
    ) {
      throw new Error(`Invalid Tradle result: ${serializedResult}`);
    }
    // Start with the metadata.
    let intResult: number;
    [intResult, serializedResult] = nextInt(serializedResult);
    let numGuesses = intResult % 7;
    const isWin = numGuesses !== 6;
    if (isWin) {
      // Switch back to 1-indexed.
      numGuesses++;
    }
    const gameNumber = Math.floor(intResult / 7);

    // Then decode the guess rows.
    const guesses: string[] = [];
    for (let guessIdx = 0; guessIdx < numGuesses; ++guessIdx) {
      const pow = guessIdx % 3;
      if (pow === 0) {
        [intResult, serializedResult] = nextInt(serializedResult, guessEncodingWidth);
      }
      const closeness = Math.floor(intResult / 11 ** pow) % 11;
      guesses.push(numberToEmojiSquareScale(closeness, emojiSquares.lightGrey));
    }
    return `#Tradle #${gameNumber} ${isWin ? numGuesses : "X"}/6\n${guesses.join("\n")}`;
  }
}

import { BaseGame, GameScore } from "../baseGame";
import { DEFAULT_WORD_WIDTH, intToBase64, nextInt } from "../util/base64";
import { arrows, emojiSquares, emojiToRegexUnion, splitEmojiLines } from "../util/emoji";

const winEmoji = "✅";

export class Costcodle extends BaseGame {
  get name(): string {
    return "Costcodle";
  }

  get link(): string {
    return "https://costcodle.com/";
  }

  _buildResultRegex(): RegExp {
    const guessStr =
      emojiToRegexUnion([arrows.u, arrows.d]) +
      emojiToRegexUnion([emojiSquares.red, emojiSquares.yellow]);
    return new RegExp(
      `Costcodle #(\\d+) ([1-6X])/6\\s+((?:${guessStr}\\s*){0,6}${winEmoji}?)`,
      "u",
    );
  }

  serializeResult(gameResult: RegExpMatchArray) {
    const [, gameNumber, numGuesses, guessesBlock] = gameResult;
    const isWin = numGuesses !== "X";

    // First encode the game number, num guesses. Use 7 guesses for a loss.
    let encoded = intToBase64(parseInt(gameNumber) * 7 + (isWin ? parseInt(numGuesses) - 1 : 6));
    const guesses = splitEmojiLines(guessesBlock);
    // Each guess is two bits: up/down and near/far. 2 bits * 6 guesses = 12 bits
    // which fits in just one 18bit b64 word.
    // We will ignore the last green check if it's a win; we encode win/loss above.
    let guessEncoding = 0;
    for (let guessIdx = 0; guessIdx < guesses.length; ++guessIdx) {
      // Split unicode characters into individual characters.
      const guessChars = guesses[guessIdx];
      if (guessChars[0] === winEmoji) {
        break;
      }
      const thisGuess =
        (guessChars[0] === arrows.u ? 0 : 1) + (guessChars[1] === emojiSquares.red ? 0 : 2);
      guessEncoding += thisGuess * 4 ** guessIdx;
    }
    encoded += intToBase64(guessEncoding);
    const score = isWin
      ? GameScore.Win
      : guesses.some((guess) => guess.includes(emojiSquares.yellow))
        ? GameScore.NearWin
        : GameScore.Loss;
    return { score, serializedResult: encoded };
  }

  deserialize(serializedResult: string) {
    if (serializedResult.length !== DEFAULT_WORD_WIDTH * 2) {
      throw new Error(`Invalid Costcodle result: ${serializedResult}`);
    }
    // Start with the metadata.
    let intResult: number;
    [intResult, serializedResult] = nextInt(serializedResult);
    let numGuesses = (intResult % 7) + 1;
    const isWin = numGuesses !== 7;
    const gameNumber = Math.floor(intResult / 7);

    // Then decode the guess rows.
    [intResult, serializedResult] = nextInt(serializedResult);
    const guesses: string[] = [];
    for (let guessIdx = 0; guessIdx < numGuesses - 1; ++guessIdx) {
      const guessCode = Math.floor(intResult / 4 ** guessIdx) % 4;
      const arrow = guessCode & 1 ? arrows.d : arrows.u;
      const color = guessCode & 2 ? emojiSquares.yellow : emojiSquares.red;
      guesses.push(`${arrow}${color}`);
    }
    if (isWin) {
      guesses.push(winEmoji);
    }
    return `Costcodle #${gameNumber} ${isWin ? numGuesses : "X"}/6\n${guesses.join("\n")}`;
  }
}

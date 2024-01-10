import { BaseGame, GameScore } from "../baseGame";
import { DEFAULT_WORD_WIDTH, intToBase64, nextInt } from "../util/base64";
import { arrows as allArrows, emojiToRegexUnion, splitEmoji } from "../util/emoji";
import { decodeEmoji, encodeEmoji } from "../util/gameHelpers";

const winEmoji = "🏡";
const loseEmoji = "❌";
const maxArrows = 8;
const numArrowsEncodingBase = maxArrows + 1;
const arrows = [allArrows.u, allArrows.d, allArrows.ur, allArrows.dr];
const arrowRegex = emojiToRegexUnion(arrows);
const arrowValues: Record<string, number> = Object.fromEntries(
  arrows.map((key, idx) => [key, idx]),
);

const highestBit = 1 << (DEFAULT_WORD_WIDTH * 6 - 1);

export class Listed extends BaseGame {
  get name(): string {
    return "Listed";
  }

  get link(): string {
    return "https://listed.fun/";
  }

  _buildResultRegex(): RegExp {
    const guessStr = `${arrowRegex}{0,${maxArrows}}(?:${winEmoji}|${loseEmoji})`;
    return new RegExp(
      `I (?:got|was stumped by) #Listed game (\\d+)(?: in ([1-${
        maxArrows + 1
      }]) guess(?:es)?)?:\\s+(${guessStr})`,
      "u",
    );
  }

  serializeResult(gameResult: RegExpMatchArray) {
    const [, gameNumber, numGuesses, guessesBlock] = gameResult;
    const guesses = splitEmoji(guessesBlock);
    const isWin = guesses.includes(winEmoji);
    const numArrows = isWin ? parseInt(numGuesses) - 1 : maxArrows;
    if (numArrows + 1 !== guesses.length) {
      throw new Error("Guess count doesn't match number of guess emoji");
    }

    // First encode the game number and num guesses. Use one more than max guesses for a loss.
    let metadata = parseInt(gameNumber) * numArrowsEncodingBase + numArrows;
    if (isWin && numArrows === maxArrows) {
      // Backwards compatible way to handle a 9 guess win. Previously this was unsupported.
      metadata |= highestBit;
    }
    const serializedResult =
      intToBase64(metadata) + intToBase64(encodeEmoji(guesses.slice(0, -1), arrowValues));
    const score = isWin
      ? GameScore.Win
      : guesses.some((guess) => guess === allArrows.ur || guess === allArrows.dr)
        ? GameScore.NearWin
        : GameScore.Loss;
    return { score, serializedResult };
  }

  deserialize(serializedResult: string) {
    if (serializedResult.length !== DEFAULT_WORD_WIDTH * 2) {
      throw new Error(`Invalid Listed result: ${serializedResult}`);
    }
    // Start with the metadata.
    let intResult: number;
    [intResult, serializedResult] = nextInt(serializedResult);
    let isWin = false;
    if (intResult & highestBit) {
      isWin = true;
      intResult &= ~highestBit;
    }
    const numArrows = intResult % numArrowsEncodingBase;
    isWin = isWin || numArrows !== maxArrows;
    if (intResult & highestBit) {
      // Backwards compatible way to handle a 9 guess win. Previously this was unsupported.
      isWin = true;
      intResult &= ~highestBit;
    }
    const gameNumber = Math.floor(intResult / numArrowsEncodingBase);

    // Then decode the guess rows.
    [intResult, serializedResult] = nextInt(serializedResult);
    const guesses = decodeEmoji(intResult, arrows, numArrows);
    guesses.push(isWin ? winEmoji : loseEmoji);
    const header = isWin
      ? `I got #Listed game ${gameNumber} in ${numArrows + 1} guess${numArrows > 0 ? "es" : ""}:`
      : `I was stumped by #Listed game ${gameNumber}:`;
    return `${header}\n\n${guesses.join("")}`;
  }
}

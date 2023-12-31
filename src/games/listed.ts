import { BaseGame, GameScore } from "../baseGame";
import { DEFAULT_WORD_WIDTH, intToBase64, nextInt } from "../util/base64";
import { arrows as allArrows, emojiToRegexUnion, splitEmoji } from "../util/emoji";

const winEmoji = "🏡";
const loseEmoji = "❌";
const maxGuesses = 8;
const guessBase = maxGuesses + 1;
const arrows = [allArrows.u, allArrows.d, allArrows.ur, allArrows.dr];
const arrowRegex = emojiToRegexUnion(arrows);
const arrowValues: Record<string, number> = Object.fromEntries(
  arrows.map((key, idx) => [key, idx]),
);

export class Listed extends BaseGame {
  get name(): string {
    return "Listed";
  }

  get link(): string {
    return "https://listed.fun/";
  }

  _buildResultRegex(): RegExp {
    const guessStr = `${arrowRegex}{0,${maxGuesses}}(?:${winEmoji}|${loseEmoji})`;
    return new RegExp(
      `I (?:got|was stumped by) #Listed game (\\d+)(?: in ([1-${maxGuesses}]) guesses)?:\\s+(${guessStr})`,
      "u",
    );
  }

  serializeResult(gameResult: RegExpMatchArray) {
    const [, gameNumber, numGuesses, guessesBlock] = gameResult;
    const guesses = splitEmoji(guessesBlock);
    const isWin = guesses.includes(winEmoji);
    if (isWin && parseInt(numGuesses) !== guesses.length) {
      throw new Error("Winning guess count doesn't match guess count");
    } else if (!isWin && guesses.length !== maxGuesses + 1) {
      throw new Error("Guess count doesn't match max guesses");
    }

    // First encode the game number and num guesses. Use one more than max guesses for a loss.
    let encoded = intToBase64(
      parseInt(gameNumber) * guessBase + (isWin ? parseInt(numGuesses) - 1 : maxGuesses),
    );
    // Each guess is two bits (one of the four arrows). 2 bits * 8 guesses = 16 bits
    // which fits in just one 18bit b64 word.
    // We will ignore the last win emoji guess it's a win; we encode win/loss above.
    let guessEncoding = 0;
    // The last character is the win/lose indicator.
    for (let guessIdx = 0; guessIdx < guesses.length - 1; ++guessIdx) {
      const guessChar = guesses[guessIdx];
      if (guessChar === winEmoji) {
        break;
      }
      const thisGuess = arrowValues[guessChar];
      guessEncoding += thisGuess * 4 ** guessIdx;
    }
    encoded += intToBase64(guessEncoding);
    const score = isWin
      ? GameScore.Win
      : guesses.some((guess) => guess === allArrows.ur || guess === allArrows.dr)
        ? GameScore.NearWin
        : GameScore.Loss;
    return { score, serializedResult: encoded };
  }

  deserialize(serializedResult: string) {
    if (serializedResult.length !== DEFAULT_WORD_WIDTH * 2) {
      throw new Error(`Invalid Listed result: ${serializedResult}`);
    }
    // Start with the metadata.
    let intResult: number;
    [intResult, serializedResult] = nextInt(serializedResult);
    let numGuesses = (intResult % guessBase) + 1;
    const isWin = numGuesses !== guessBase;
    const gameNumber = Math.floor(intResult / guessBase);

    // Then decode the guess rows.
    [intResult, serializedResult] = nextInt(serializedResult);
    const guesses: string[] = [];
    // Subtract 1 in both cases; for wins, we exclude the last guess (win emoji).
    // For losses, numGuesses = maxGuesses + 1, but we only have maxGuesses guesses.
    for (let guessIdx = 0; guessIdx < numGuesses - 1; ++guessIdx) {
      const guessCode = Math.floor(intResult / 4 ** guessIdx) % 4;
      guesses.push(arrows[guessCode]);
    }
    guesses.push(isWin ? winEmoji : loseEmoji);
    const header = isWin
      ? `I got #Listed game ${gameNumber} in ${numGuesses} guesses:`
      : `I was stumped by #Listed game ${gameNumber}:`;
    return `${header}\n\n${guesses.join("")}`;
  }
}

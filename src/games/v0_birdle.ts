import { BaseGame, GameScore } from "../baseGame";
import { DEFAULT_WORD_WIDTH, intToBase64, nextInt } from "../util/base64";
import { emojiToRegexUnion, splitEmojiLines } from "../util/emoji";

const maxGuesses = 6;
const birdsPerRow = 4;
const yesEmoji = "🐦";
const noEmoji = "❌";

export class V0Birdle extends BaseGame {
  get name(): string {
    return "Birdle";
  }

  get link(): string {
    return "https://www.play-birdle.com/";
  }

  _buildResultRegex(): RegExp {
    const fourEmoji = emojiToRegexUnion([yesEmoji, noEmoji]) + `{${birdsPerRow}}`;
    return new RegExp(
      `Birdle #(\\d+) ([1-6X])\\/6\\s+((?:${fourEmoji}\\s*){1,${maxGuesses}})`,
      "u",
    );
  }

  serializeResult(gameResult: RegExpMatchArray) {
    const [, gameNumber, numGuessesStr, guessesBlock] = gameResult;
    const isWin = numGuessesStr !== "X";

    // First encode the game number, num guesses, and percent score.
    const wrongGuesses = isWin ? parseInt(numGuessesStr) - 1 : maxGuesses;
    let encoded = intToBase64(parseInt(gameNumber) * (maxGuesses + 1) + wrongGuesses);
    const numGuesses = wrongGuesses + (isWin ? 1 : 0);
    const guesses = splitEmojiLines(guessesBlock);
    if (guesses.length !== numGuesses) {
      throw new Error(`Expected ${numGuesses} guesses, got ${guesses.length}`);
    }
    // Each guess is 0-4 yes emoji padded with no emoji. We can ignore the winning guess since
    // we encoded the wrong guesses, so we can encode each wrong guess as a number 0-3 (2 bits).
    // For a max of 6 guesses, we can fit this in 2 base64 characters (12 bits).
    let guessEncoding = 0;
    let allButOneBird = false;
    for (let guessIdx = 0; guessIdx < wrongGuesses; ++guessIdx) {
      const numBirds = guesses[guessIdx].filter((emoji) => emoji === yesEmoji).length;
      if (numBirds === birdsPerRow - 1) {
        allButOneBird = true;
      }
      guessEncoding += numBirds << (guessIdx * 2);
    }
    encoded += intToBase64(guessEncoding, 2);
    const score = isWin ? GameScore.Win : allButOneBird ? GameScore.NearWin : GameScore.Loss;
    return { score, serializedResult: encoded };
  }

  deserialize(serializedResult: string) {
    if (serializedResult.length !== DEFAULT_WORD_WIDTH + 2) {
      throw new Error(`Invalid Birdle result: ${serializedResult}`);
    }
    // Start with the metadata.
    let intResult: number;
    [intResult, serializedResult] = nextInt(serializedResult);
    const gameNumber = Math.floor(intResult / (maxGuesses + 1));
    const wrongGuesses = intResult % (maxGuesses + 1);
    const isWin = wrongGuesses < maxGuesses;
    // Then decode the guess rows.
    [intResult, serializedResult] = nextInt(serializedResult, 2);
    const guesses: string[] = [];
    for (let guessIdx = 0; guessIdx < wrongGuesses; ++guessIdx) {
      const numBirds = (intResult >> (guessIdx * 2)) & 0b11;
      guesses.push(yesEmoji.repeat(numBirds) + noEmoji.repeat(birdsPerRow - numBirds));
    }
    if (isWin) {
      guesses.push(yesEmoji.repeat(birdsPerRow));
    }
    return `Birdle #${gameNumber} ${isWin ? wrongGuesses + 1 : "X"}/6\n${guesses.join("\n")}`;
  }
}

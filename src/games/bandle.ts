import { BaseGame, GameScore } from "../baseGame";
import { DEFAULT_WORD_WIDTH, intToBase64, nextInt } from "../util/base64";
import { emojiSquares, emojiToRegexUnion, splitEmoji } from "../util/emoji";
import { decodeEmoji, encodeEmoji } from "../util/gameHelpers";

const guessSquares = [emojiSquares.black, emojiSquares.red, emojiSquares.yellow];
const guessCodes = Object.fromEntries(guessSquares.map((square, idx) => [square, idx]));
const maxGuesses = 6;
const guessBase = maxGuesses + 1;
const guessEncodingWidth = 2;

export class Bandle extends BaseGame {
  get name(): string {
    return "Bandle";
  }

  get link(): string {
    return "https://bandle.app/";
  }

  _buildResultRegex(): RegExp {
    const squareRegex = emojiToRegexUnion([
      ...guessSquares,
      emojiSquares.green,
      emojiSquares.white,
    ]);
    return new RegExp(`Bandle #(\\d+) ([1-6Xx])/6\\s+((?:${squareRegex}\\s*){${maxGuesses}})`, "u");
  }

  serializeResult(gameResult: RegExpMatchArray) {
    const [, gameNumber, numGuesses, guessLine] = gameResult;
    const numGuessesInt = numGuesses === "X" || numGuesses === "x" ? null : parseInt(numGuesses);
    const guesses = splitEmoji(guessLine);
    const greenIdx = guesses.indexOf(emojiSquares.green);
    if ((greenIdx === -1) !== (numGuessesInt === null)) {
      throw new Error(`Invalid Bandle result: ${guessLine}`);
    }
    const score =
      greenIdx === -1
        ? guesses.includes(emojiSquares.yellow)
          ? GameScore.NearWin
          : GameScore.Loss
        : GameScore.Win;
    const wrongGuesses = greenIdx === -1 ? maxGuesses : greenIdx;
    let serializedResult = intToBase64(parseInt(gameNumber) * guessBase + wrongGuesses);
    // This is a max of 6 base-3 digits, so it fits in 2 base64 characters.
    const encodedGuesses = encodeEmoji(guesses.slice(0, wrongGuesses), guessCodes);
    serializedResult += intToBase64(encodedGuesses, guessEncodingWidth);
    return { score, serializedResult };
  }

  deserialize(serializedResult: string) {
    if (serializedResult.length !== DEFAULT_WORD_WIDTH + guessEncodingWidth) {
      throw new Error(`Invalid Bandle result: ${serializedResult}`);
    }
    let intResult: number;
    [intResult, serializedResult] = nextInt(serializedResult);
    const wrongGuesses = intResult % guessBase;
    const isWin = wrongGuesses < maxGuesses;
    const gameNumber = Math.floor(intResult / guessBase);
    [intResult, serializedResult] = nextInt(serializedResult, guessEncodingWidth);
    const decodedGuesses = decodeEmoji(intResult, guessSquares, wrongGuesses);
    const resultEmoji = decodedGuesses;
    if (isWin) {
      resultEmoji.push(emojiSquares.green);
    }
    for (let i = wrongGuesses + 1; i < maxGuesses; ++i) {
      resultEmoji.push(emojiSquares.white);
    }
    return `Bandle #${gameNumber} ${
      isWin ? wrongGuesses + 1 : "x"
    }/${maxGuesses}\n${resultEmoji.join("")}`;
  }
}

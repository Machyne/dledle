import { BaseGame, GameScore } from "../baseGame";
import { DEFAULT_WORD_WIDTH, intToBase64, nextInt } from "../util/base64";
import { emojiSquares, emojiToRegexUnion, splitEmoji } from "../util/emoji";

const squareRegex = emojiToRegexUnion([
  emojiSquares.red,
  emojiSquares.green,
  emojiSquares.grey,
  emojiSquares.lightGrey,
]);

export type SimpleGuessCountGame = {
  regex: RegExp;
  serializeResult: (gameResult: RegExpMatchArray) => { score: GameScore; serializedResult: string };
  deserialize: (serializedResult: string) => string;
};

export function simpleGuessCountGame(args: {
  prefixEmoji: string;
  maxGuesses: number;
  gameName: string;
  greySquare: string;
  numNewlines?: number;
}): SimpleGuessCountGame {
  const guessBase = args.maxGuesses + 1;
  return {
    regex: new RegExp(
      `${args.gameName} #(\\d+)\\s+${args.prefixEmoji}\\s*((?:${squareRegex}\\s*){${args.maxGuesses}})`,
      "u",
    ),
    serializeResult: function (gameResult: RegExpMatchArray) {
      const [, gameNumber, guessLine] = gameResult;
      const guesses = splitEmoji(guessLine);
      const greenIdx = guesses.indexOf(emojiSquares.green);
      const score = greenIdx === -1 ? GameScore.Loss : GameScore.Win;
      const serializedResult = intToBase64(
        parseInt(gameNumber) * guessBase + (greenIdx === -1 ? args.maxGuesses : greenIdx),
      );
      return { score, serializedResult };
    },
    deserialize: function (serializedResult: string) {
      if (
        // Just the metadata.
        serializedResult.length !== DEFAULT_WORD_WIDTH
      ) {
        throw new Error(`Invalid ${args.gameName} result: ${serializedResult}`);
      }
      let intResult: number;
      [intResult, serializedResult] = nextInt(serializedResult);
      const numReds = intResult % guessBase;
      const gameNumber = Math.floor(intResult / guessBase);
      const resultEmoji = [args.prefixEmoji];
      for (let i = 0; i < numReds; ++i) {
        resultEmoji.push(emojiSquares.red);
      }
      if (numReds < args.maxGuesses) {
        resultEmoji.push(emojiSquares.green);
      }
      for (let i = numReds + 1; i < args.maxGuesses; ++i) {
        resultEmoji.push(args.greySquare);
      }
      return `${args.gameName} #${gameNumber}${"\n".repeat(
        args.numNewlines ?? 1,
      )}${resultEmoji.join(" ")}`;
    },
  };
}

import { BaseGame, GameScore } from "../baseGame";
import { DEFAULT_WORD_WIDTH, base64ToInt, intToBase64 } from "../util/base64";
import { emojiSquares, emojiToRegexUnion, splitEmoji } from "../util/emoji";
import { simpleGuessCountGame } from "../util/simpleGuessCountGame";

const baseArgs = {
  prefixEmoji: "🎮",
  maxGuesses: 6,
  gameName: "#GuessTheGame",
  greySquare: emojiSquares.lightGrey,
  numNewlines: 2,
};
const { serializeResult, deserialize } = simpleGuessCountGame(baseArgs);
const squareRegex = emojiToRegexUnion([
  emojiSquares.red,
  emojiSquares.green,
  emojiSquares.yellow,
  emojiSquares.grey,
  emojiSquares.lightGrey,
]);

export class GuessTheGame extends BaseGame {
  get name(): string {
    return "GuessTheGame";
  }

  get link(): string {
    return "https://guessthe.game/";
  }

  _buildResultRegex(): RegExp {
    return new RegExp(
      `${baseArgs.gameName} #(\\d+)\\s+${baseArgs.prefixEmoji}\\s*((?:${squareRegex}\\s*){${baseArgs.maxGuesses}})`,
      "u",
    );
  }

  serializeResult(gameResult: RegExpMatchArray) {
    const baseResult = serializeResult(gameResult);
    // This game launched without handling yellow squares. Oops! Handle them additively so any
    // old encoded data is still valid.
    const [, , guessLine] = gameResult;
    const guesses = splitEmoji(guessLine);
    if (guesses.some((char) => char === emojiSquares.yellow)) {
      // We only have six games, so we can use a single b64 character to encode the yellow squares.
      let yellowCodes = 0;
      guesses.forEach((char, idx) => {
        if (char === emojiSquares.yellow) {
          yellowCodes += 1 << idx;
        }
      });
      baseResult.serializedResult += intToBase64(yellowCodes, 1);
      if (baseResult.score === GameScore.Loss) {
        baseResult.score = GameScore.NearWin;
      }
    }
    return baseResult;
  }

  deserialize(serializedResult: string) {
    // This game launched without handling yellow squares. Oops! Handle them additively so any
    // old encoded data is still valid.
    if (serializedResult.length !== DEFAULT_WORD_WIDTH + 1) {
      return deserialize(serializedResult);
    }
    const yellowCodes = base64ToInt(serializedResult.slice(DEFAULT_WORD_WIDTH), 1);
    const baseReturn = deserialize(serializedResult.slice(0, DEFAULT_WORD_WIDTH));
    const lines = baseReturn.split("\n");
    const lastLine = splitEmoji(lines[lines.length - 1]);
    for (let i = 0; i < baseArgs.maxGuesses; ++i) {
      if (yellowCodes & (1 << i)) {
        // Add 1 to skip the prefix index.
        lastLine[i + 1] = emojiSquares.yellow;
      }
    }
    lines[lines.length - 1] = lastLine.join(" ");
    return lines.join("\n");
  }
}

import { BaseGame } from "../baseGame";
import { emojiSquares } from "../util/emoji";
import { simpleGuessCountGame } from "../util/simpleGuessCountGame";

const { regex, serializeResult, deserialize } = simpleGuessCountGame({
  prefixEmoji: "🎮",
  maxGuesses: 6,
  gameName: "#GuessTheGame",
  greySquare: emojiSquares.lightGrey,
  numNewlines: 2,
});

export class GuessTheGame extends BaseGame {
  get name(): string {
    return "GuessTheGame";
  }

  get link(): string {
    return "https://guessthe.game/";
  }

  _buildResultRegex(): RegExp {
    return regex;
  }

  serializeResult(gameResult: RegExpMatchArray) {
    return serializeResult(gameResult);
  }

  deserialize(serializedResult: string) {
    return deserialize(serializedResult);
  }
}

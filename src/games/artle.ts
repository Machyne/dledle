import { BaseGame } from "../baseGame";
import { emojiSquares } from "../util/emoji";
import { simpleGuessCountGame } from "../util/simpleGuessCountGame";

const { regex, serializeResult, deserialize } = simpleGuessCountGame({
  prefixEmoji: "🎨",
  maxGuesses: 4,
  gameName: "Artle",
  greySquare: emojiSquares.white,
});

export class Artle extends BaseGame {
  get name(): string {
    return "Artle";
  }

  get link(): string {
    return "https://www.nga.gov/Artle";
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

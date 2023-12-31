import { BaseGame } from "../baseGame";
import { emojiSquares } from "../util/emoji";
import { simpleGuessCountGame } from "../util/simpleGuessCountGame";

const { regex, serializeResult, deserialize } = simpleGuessCountGame({
  prefixEmoji: "🎥",
  maxGuesses: 6,
  gameName: "Framed",
  greySquare: emojiSquares.grey,
});

export class Framed extends BaseGame {
  get name(): string {
    return "Framed";
  }

  get link(): string {
    return "https://framed.wtf/";
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

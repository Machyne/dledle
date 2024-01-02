import { BaseGame, GameScore } from "../baseGame";
import { intToBase64, nextInt } from "../util/base64";
import { emojiCircles, emojiToRegexUnion, splitEmoji } from "../util/emoji";
import { decodeEmoji, encodeEmoji } from "../util/gameHelpers";

const emojiPrefix = "#️⃣";
const guessLookup = [emojiCircles.white, emojiCircles.green, emojiCircles.red, emojiCircles.yellow];
const guessCodes = Object.fromEntries(guessLookup.map((circle, idx) => [circle, idx]));
const maxGuesses = 3;

export class CultureTag extends BaseGame {
  get name(): string {
    return "CultureTag";
  }

  get link(): string {
    return "https://iykyk.com/";
  }

  _buildResultRegex(): RegExp {
    return new RegExp(
      `Daily CultureTag #(\\d+)\\s+${emojiPrefix}\\s*((?:${emojiToRegexUnion(
        guessLookup,
      )}\\s*){${maxGuesses}})`,
      "u",
    );
  }

  serializeResult(gameResult: RegExpMatchArray) {
    const [, gameNumber, guessLine] = gameResult;
    const guesses = splitEmoji(guessLine);
    const score = guesses.includes(emojiCircles.green)
      ? GameScore.Win
      : guesses.includes(emojiCircles.yellow)
        ? GameScore.NearWin
        : GameScore.Loss;
    let serializedResult = intToBase64(parseInt(gameNumber), 2);
    // 3 2-bit guesses = 6bits so it fits in one b64 character.
    const encodedGuesses = encodeEmoji(guesses, guessCodes);
    serializedResult += intToBase64(encodedGuesses, 1);
    return { score, serializedResult };
  }

  deserialize(serializedResult: string) {
    if (serializedResult.length !== 3) {
      throw new Error(`Invalid CultureTag result: ${serializedResult}`);
    }
    let intResult: number;
    [intResult, serializedResult] = nextInt(serializedResult, 2);
    const gameNumber = intResult;
    [intResult, serializedResult] = nextInt(serializedResult, 1);
    const decodedGuesses = decodeEmoji(intResult, guessLookup, maxGuesses);
    return `Daily CultureTag #${gameNumber}\n${emojiPrefix}${decodedGuesses.join("")}`;
  }
}

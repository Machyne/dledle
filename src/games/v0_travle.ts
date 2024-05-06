import { BaseGame, GameScore } from "../baseGame";
import { intToBase64, nextInt } from "../util/base64";
import { emojiSquares, emojiToRegexUnion, listToValueMap, splitEmoji } from "../util/emoji";
import { decodeEmoji, encodeEmoji } from "../util/gameHelpers";

const validHints = [emojiSquares.black, emojiSquares.red, emojiSquares.orange, "✅"];
const hintValues = listToValueMap(validHints);
const chunkSize = 3; // 2 bits per hint = 3 hints per base64 character.

export class V0Travle extends BaseGame {
  get name(): string {
    return "Travle";
  }

  get link(): string {
    return "https://travle.earth";
  }

  _buildResultRegex(): RegExp {
    const hintRe = emojiToRegexUnion(validHints);
    const optionalAway = "\\s*(?:\\((\\d+) away\\))?";

    return new RegExp(
      `#travle #(\\d+) \\(([0-9\\?]+)/(\\d+)\\)${optionalAway}\\s*(${hintRe}+)`,
      "u",
    );
  }

  serializeResult(gameResult: RegExpMatchArray) {
    const [, gameNumber, guessesTakenStr, maxGuessesStr, optionalAwayStr, guessesBlock] =
      gameResult;
    // Result will be: 2chars game number, 1char guesses taken, 1 char max guesses, optional 1 char away, and variable length guesses.
    let encoded = "";
    encoded += intToBase64(parseInt(gameNumber), 2);
    const guessesTaken = guessesTakenStr === "?" ? 0 : parseInt(guessesTakenStr);
    encoded += intToBase64(guessesTaken, 1);
    const maxGuesses = parseInt(maxGuessesStr);
    encoded += intToBase64(maxGuesses, 1);
    let optionalAway = 0;
    if (!!optionalAwayStr !== (guessesTaken === 0)) {
      throw new Error(`Invalid Travle away: ${optionalAwayStr} (guessesTaken: ${guessesTakenStr})`);
    }
    if (optionalAwayStr) {
      optionalAway = parseInt(optionalAwayStr);
      encoded += intToBase64(optionalAway, 1);
    }
    const guesses = splitEmoji(guessesBlock);
    const expectedNumGuesses = guessesTaken === 0 ? maxGuesses : guessesTaken;
    if (guesses.length !== expectedNumGuesses) {
      throw new Error(`Invalid Travle guesses: ${guessesBlock} (expected ${expectedNumGuesses})`);
    }
    while (guesses.length > 0) {
      const chunk = guesses.splice(0, chunkSize);
      encoded += intToBase64(encodeEmoji(chunk, hintValues), 1);
    }
    return {
      serializedResult: encoded,
      score:
        guessesTaken !== 0
          ? GameScore.Win
          : optionalAway === 1
            ? GameScore.NearWin
            : GameScore.Loss,
    };
  }

  deserialize(serializedResult: string) {
    if (serializedResult.length < 4) {
      throw new Error(`Invalid Travle result: ${serializedResult}`);
    }
    let intResult: number;
    [intResult, serializedResult] = nextInt(serializedResult, 2);
    const gameNumber = intResult;
    [intResult, serializedResult] = nextInt(serializedResult, 1);
    const guessesTaken = intResult;
    [intResult, serializedResult] = nextInt(serializedResult, 1);
    const maxGuesses = intResult;
    let optionalAway = 0;
    if (guessesTaken === 0) {
      [intResult, serializedResult] = nextInt(serializedResult, 1);
      optionalAway = intResult;
    }
    const expectedNumGuesses = guessesTaken === 0 ? maxGuesses : guessesTaken;
    const guesses: Array<string> = [];
    while (serializedResult.length > 0) {
      [intResult, serializedResult] = nextInt(serializedResult, 1);
      guesses.push(...decodeEmoji(intResult, validHints, chunkSize));
    }
    if (guesses.length < expectedNumGuesses) {
      throw new Error(`Invalid Travle guesses: ${guesses} (expected ${expectedNumGuesses})`);
    }
    guesses.splice(expectedNumGuesses);
    return `#travle #${gameNumber} (${
      guessesTaken === 0 ? "?" : guessesTaken.toString()
    }/${maxGuesses})${optionalAway === 0 ? "" : ` (${optionalAway} away)`}\n${guesses.join("")}`;
  }
}

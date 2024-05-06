import { BaseGame, GameScore } from "../baseGame";
import { intToBase64, nextInt } from "../util/base64";
import { emojiSquares, emojiToRegexUnion, listToValueMap, splitEmoji } from "../util/emoji";
import { decodeEmoji, encodeEmoji } from "../util/gameHelpers";

const validGuesses = [emojiSquares.red, emojiSquares.orange, emojiSquares.green, "✅"];
const guessValues = listToValueMap(validGuesses);
// hints are base 5; we can fit 5 of these in 2 b64 chars
const guessChunkSize = 3;
const guessCharLen = 1;

export class Travle extends BaseGame {
  get name(): string {
    return "Travle";
  }

  get link(): string {
    return "https://travle.earth";
  }

  _buildResultRegex(): RegExp {
    const hintRe = `(${emojiToRegexUnion(validGuesses)}+)`;
    const extraGuesses = "\\s*(?:\\+(\\d+))?";
    const optionalPerfect = "\\s*(\\(Perfect\\))?";
    const optionalAway = "\\s*(?:\\((\\d+) away\\))?";
    const optionalHint = "\\s*(?:\\((\\d+) hints?\\))?";

    return new RegExp(
      `#travle #(\\d+)${extraGuesses}${optionalPerfect}${optionalAway}${optionalHint}\\s*${hintRe}`,
      "u",
    );
  }

  serializeResult(gameResult: RegExpMatchArray) {
    const [
      ,
      gameNumber,
      extraGuessesStr,
      perfectStr,
      optionalAwayStr,
      optionalHintStr,
      guessesBlock,
    ] = gameResult;
    // Result will be:
    // - 2 chars game number and numHints
    // - 1 char of isWin and extraGuesses / numAway
    // - 2 chars numGuesses
    // - n chars guesses
    let encoded = "";
    const numHints = optionalHintStr ? parseInt(optionalHintStr) : 0;
    encoded += intToBase64(parseInt(gameNumber) * 4 + numHints, 2);
    const isWin = !!extraGuessesStr;
    let extraGuesses = isWin ? parseInt(extraGuessesStr) + 1 : 0;
    if (perfectStr) {
      extraGuesses = 0;
    }
    let numAway = 0;
    if (!isWin) {
      if (!optionalAwayStr) {
        throw new Error(
          `Invalid Travle share: missing away on a loss: ${gameResult[0].trim().split("\n")[0]}`,
        );
      }
      numAway = parseInt(optionalAwayStr);
    }
    // 1 bit for isWin, the other 5 bits for extraGuesses or numAway
    encoded += intToBase64(isWin ? 2 * extraGuesses + 1 : 2 * numAway, 1);

    const guesses = splitEmoji(guessesBlock);
    encoded += intToBase64(guesses.length, 2);

    while (guesses.length > 0) {
      const chunk = guesses.splice(0, guessChunkSize);
      encoded += intToBase64(encodeEmoji(chunk, guessValues), guessCharLen);
    }
    return {
      serializedResult: encoded,
      score: isWin ? GameScore.Win : numAway === 1 ? GameScore.NearWin : GameScore.Loss,
    };
  }

  deserialize(serializedResult: string) {
    if (serializedResult.length < 5 + guessCharLen) {
      throw new Error(`Invalid Travle result: ${serializedResult}`);
    }
    let intResult: number;
    [intResult, serializedResult] = nextInt(serializedResult, 2);
    const numHints = intResult % 4;
    const gameNumber = Math.floor(intResult / 4);
    [intResult, serializedResult] = nextInt(serializedResult, 1);
    const isWin = intResult & 1;
    const extraGuesses = isWin ? (intResult - 1) / 2 : 0;
    const numAway = isWin ? 0 : intResult / 2;
    [intResult, serializedResult] = nextInt(serializedResult, 2);
    const numGuesses = intResult;
    const guesses: Array<string> = [];
    while (serializedResult.length > 0) {
      [intResult, serializedResult] = nextInt(serializedResult, guessCharLen);
      guesses.push(...decodeEmoji(intResult, validGuesses, guessChunkSize));
    }
    if (guesses.length < numGuesses) {
      throw new Error(`Invalid Travle guesses: ${guesses} (expected ${numGuesses})`);
    }
    guesses.splice(numGuesses);

    let prefix = `#travle #${gameNumber}`;
    if (isWin) {
      if (extraGuesses === 0) {
        prefix += " +0 (Perfect)";
      } else {
        prefix += ` +${extraGuesses - 1}`;
      }
    } else {
      prefix += ` (${numAway} away)`;
    }
    if (numHints > 0) {
      prefix += ` (${numHints} hint${numHints > 1 ? "s" : ""})`;
    }
    return `${prefix}\n${guesses.join("")}`;
  }
}

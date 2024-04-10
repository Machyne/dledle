import { BaseGame, GameScore } from "../baseGame";
import { DEFAULT_WORD_WIDTH, intToBase64, nextInt } from "../util/base64";
import {
  arrows,
  countEmoji,
  emojiSquares,
  emojiToRegexUnion,
  listToValueMap,
  splitEmoji,
} from "../util/emoji";
import { decodeEmoji, encodeEmoji } from "../util/gameHelpers";

const guessGroupCounts = [5, 3, 3, 2, 1];
const guessGroupSums = (() => {
  const ret: Array<number> = [];
  let sum = 0;
  for (const count of guessGroupCounts) {
    sum += count;
    ret.push(sum);
  }
  return ret;
})();
const maxGuesses = guessGroupSums[guessGroupSums.length - 1];
const maxScore = guessGroupCounts.length;
const trophyEmoji = "🏆";
const winDiamond = "🔸️";
const sepDiamond = "🔹";
const sepDash = " - ";
const validArrows: Array<string> = [arrows.u, arrows.d];
const arrowValues = listToValueMap(validArrows);

function numArrowsToNumTrophies(numArrows: number) {
  const expectedGroupIdx = guessGroupSums.findIndex((sum) => sum > numArrows);
  return expectedGroupIdx === -1 ? 0 : maxScore - expectedGroupIdx;
}

export class Betweenle extends BaseGame {
  get name(): string {
    return "Betweenle";
  }

  get link(): string {
    return "https://betweenle.com/";
  }

  _buildResultRegex(): RegExp {
    const gameNum = "(\\d+)";
    const scoreNum = `(\\d+)/${maxScore}`;
    const trophies = `(${emojiToRegexUnion([trophyEmoji, winDiamond])}{1,${maxScore}})?`;
    const guessRegex = emojiToRegexUnion([...validArrows, emojiSquares.green, emojiSquares.white]);
    const separator = `(?:${sepDiamond}|${sepDash})`;
    const guessLine = guessGroupCounts
      .map((count) => `(?:${guessRegex}{${count}})`)
      .join(separator);
    return new RegExp(`Betweenle ${gameNum} - ${scoreNum}:\\s*${trophies}\\s*(${guessLine})`, "u");
  }

  serializeResult(gameResult: RegExpMatchArray) {
    const [, gameNumStr, scoreNumStr, trophies, guessLine] = gameResult;

    const gameNum = parseInt(gameNumStr);
    const scoreNum = parseInt(scoreNumStr);
    const numTrophies = countEmoji(trophies, trophyEmoji);
    if (numTrophies !== scoreNum) {
      throw new Error(`Invalid trophy count: ${numTrophies}`);
    }
    const useDiamonds = countEmoji(trophies, winDiamond) > 0 ? 1 : 0;

    const guessArrows = splitEmoji(guessLine).filter((emoji) => validArrows.includes(emoji));
    if (guessArrows.length > maxGuesses) {
      throw new Error(`Invalid guess count: ${guessArrows.length}`);
    }
    // Do extra checking because I'm not 100% sure about the trophies being redundant information.
    const expectedGroupScore = numArrowsToNumTrophies(guessArrows.length);
    if (expectedGroupScore !== scoreNum) {
      throw new Error(`Invalid score: ${expectedGroupScore} !== ${scoreNum}`);
    }

    // Start encoding. The score and trophies are redundant, so all we need is the game number
    // and the up/down arrows.
    let encoded = intToBase64((gameNum << 1) + useDiamonds, 2);
    // To encode the arrows, we need 14 bits for the up/downs plus 4 bits for numArrows = 18 bits,
    // which is 3 base64 characters.
    const arrowEncoding = encodeEmoji(guessArrows, arrowValues);
    encoded += intToBase64((arrowEncoding << 4) + guessArrows.length);
    return { score: scoreNum === 0 ? GameScore.Loss : GameScore.Win, serializedResult: encoded };
  }

  deserialize(serializedResult: string) {
    if (serializedResult.length !== 2 + DEFAULT_WORD_WIDTH) {
      throw new Error(`Invalid Betweenle result: ${serializedResult}`);
    }
    let intResult: number;
    [intResult, serializedResult] = nextInt(serializedResult, 2);
    const useDiamonds = intResult & 1;
    const gameNum = Math.floor(intResult >> 1);
    [intResult, serializedResult] = nextInt(serializedResult);
    const numArrows = intResult & 0b1111;
    const emoji = decodeEmoji(Math.floor(intResult >> 4), validArrows, numArrows);
    const isWin = numArrows < maxGuesses;
    if (isWin) {
      emoji.push(emojiSquares.green);
      while (emoji.length < maxGuesses) {
        emoji.push(emojiSquares.white);
      }
    }
    const score = numArrowsToNumTrophies(numArrows);
    const sep = useDiamonds ? sepDiamond : sepDash;
    const sepIndexes = [...guessGroupSums].reverse().slice(1);
    for (const idx of sepIndexes) {
      emoji.splice(idx, 0, sep);
    }

    const trophyLine =
      trophyEmoji.repeat(score) + (useDiamonds ? winDiamond.repeat(maxScore - 1) : "");

    return `Betweenle ${gameNum} - ${score}/${maxScore}:\n\n${trophyLine}\n\n${emoji.join("")}`;
  }
}

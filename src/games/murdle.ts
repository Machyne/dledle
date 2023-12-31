import { BaseGame, GameScore } from "../baseGame";
import {
  DEFAULT_WORD_WIDTH,
  datePartsToBase64,
  intToBase64,
  nextDateParts,
  nextInt,
} from "../util/base64";
import { DateParts, ymd } from "../util/dateHelpers";
import { emojiToNumber, numberEmojiRegex, numberToEmoji, splitEmoji } from "../util/emoji";

const preWinEmoji = "⚖️";
const winEmoji = "👤";
const greenCheck = "✅";
const redX = "❌";
const bigSpace = " ".repeat(5);
const guessHeaderLine = ["👤🔪🏡", "🕰️"].join(bigSpace);

export class Murdle extends BaseGame {
  get name(): string {
    return "Murdle";
  }

  get link(): string {
    return "https://murdle.com/";
  }

  _buildResultRegex(): RegExp {
    // TODO does the month ever go to a single digit?
    const dateLine = "Murdle for ([0-9]{2}/[0-9]{2}/[0-9]{4})";
    const timeRegex = `(${numberEmojiRegex}{1,2}:${numberEmojiRegex}{2})`;
    const guessLine = `((?:${greenCheck}|${redX}){3})\\s+${timeRegex}`;
    const footer = `${preWinEmoji}\\s+(?:${winEmoji}|${redX})`;
    return new RegExp([dateLine, guessHeaderLine, guessLine, footer].join("\\s+"), "u");
  }

  serializeResult(gameResult: RegExpMatchArray) {
    const [, date, guessesBlock, timeBlock] = gameResult;
    const splitDate = date.split("/").map((s) => parseInt(s));
    const dateParts = ymd(splitDate[2], splitDate[0], splitDate[1]);
    const guesses = splitEmoji(guessesBlock);
    const timeParts = splitEmoji(timeBlock);

    // First encode the game date.
    let encoded = datePartsToBase64(dateParts);

    // Then encode the guesses. Each game is 3 x 1-bit guesses plus a minutes/seconds count.
    // 60 seconds * 60 minutes * 8 < 64^3, so this fits in our 3 b64 characters.
    const guessBits = guesses.reduce(
      (sum, guess, idx) => sum + (guess === greenCheck ? 1 << idx : 0),
      0,
    );
    const minutes = emojiToNumber(timeParts.slice(0, timeParts.length - 3));
    const seconds = emojiToNumber(timeParts.slice(timeParts.length - 2));
    encoded += intToBase64(guessBits + seconds * 8 + minutes * 60 * 8);

    const numCorrect = guesses.filter((guess) => guess === greenCheck).length;
    const score =
      numCorrect === 3 ? GameScore.Win : numCorrect === 2 ? GameScore.NearWin : GameScore.Loss;
    return { score, serializedResult: encoded };
  }

  deserialize(serializedResult: string) {
    if (serializedResult.length !== DEFAULT_WORD_WIDTH * 2) {
      throw new Error(`Invalid Murdle result: ${serializedResult}`);
    }
    let intResult: number;
    let date: DateParts;
    [date, serializedResult] = nextDateParts(serializedResult);
    [intResult, serializedResult] = nextInt(serializedResult);
    const guessBits = intResult % 8;
    intResult = Math.floor(intResult / 8);
    const seconds = intResult % 60;
    const minutes = Math.floor(intResult / 60);
    const guesses: Array<string> = [];
    for (let idx = 0; idx < 3; ++idx) {
      const isCorrect = guessBits & (1 << idx);
      guesses.push(isCorrect ? greenCheck : redX);
    }
    // 3 yes bits (instead of counting the emoji)
    const isWin = guessBits === 7;

    const [mm, dd, yyyy] = [
      date.month.toString().padStart(2, "0"),
      date.day.toString().padStart(2, "0"),
      date.year.toString(),
    ];
    const timeStr = `${numberToEmoji(minutes)}:${numberToEmoji(seconds, 2)}`;
    return `Murdle for ${mm}/${dd}/${yyyy}\n\n${guessHeaderLine}\n${guesses.join(
      "",
    )}${bigSpace}${timeStr}\n\n${preWinEmoji}\n${isWin ? winEmoji : redX}`;
  }
}

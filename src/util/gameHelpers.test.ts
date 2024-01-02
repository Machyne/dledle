import { emojiSquares, numberEmoji, numberEmojiValues, splitEmoji } from "./emoji";
import {
  decodeEmoji,
  emojiSquareScaleToNumber,
  encodeEmoji,
  numberToEmojiSquareScale,
} from "./gameHelpers";

describe("gameHelpers", () => {
  it("should correctly convert 0-10 to/from an emoji square scale", () => {
    expect(emojiSquareScaleToNumber(splitEmoji("🟩🟩🟩🟩🟩"))).toEqual(10);
    expect(emojiSquareScaleToNumber(splitEmoji("🟩🟩🟩🟩⬛"))).toEqual(8);
    expect(emojiSquareScaleToNumber(splitEmoji("🟩🟩🟨⬛⬛"))).toEqual(5);
    expect(emojiSquareScaleToNumber(splitEmoji("🟩🟩⬛⬛⬛"))).toEqual(4);
    expect(emojiSquareScaleToNumber(splitEmoji("⬛⬛⬛⬛⬛"))).toEqual(0);

    expect(numberToEmojiSquareScale(10)).toEqual("🟩🟩🟩🟩🟩");
    expect(numberToEmojiSquareScale(8)).toEqual("🟩🟩🟩🟩⬛");
    expect(numberToEmojiSquareScale(5)).toEqual("🟩🟩🟨⬛⬛");
    expect(numberToEmojiSquareScale(4)).toEqual("🟩🟩⬛⬛⬛");
    expect(numberToEmojiSquareScale(0)).toEqual("⬛⬛⬛⬛⬛");
  });

  it("should encode and decode emoji", () => {
    const squareCodes: Record<string, number> = {
      "⬛": 0,
      "⬜": 0,
      "🟨": 1,
      "🟩": 2,
    };
    const squareLoookup = splitEmoji("⬛🟨🟩");

    const numberList = [numberEmoji[1], numberEmoji[2], numberEmoji[3], numberEmoji[0]];
    const squareList = [
      emojiSquares.green,
      emojiSquares.white,
      emojiSquares.black,
      emojiSquares.black,
      emojiSquares.yellow,
    ];
    const squareListOnlyOneGrey = squareList.map((s) =>
      s === emojiSquares.white ? emojiSquares.black : s,
    );
    expect(encodeEmoji(numberList, numberEmojiValues)).toEqual(321);
    expect(encodeEmoji(squareList, squareCodes)).toEqual(2 + 3 ** 4);
    expect(decodeEmoji(2 + 3 ** 4, squareLoookup)).toEqual(squareListOnlyOneGrey);
    expect(decodeEmoji(321, numberEmoji)).toEqual(numberList.slice(0, 3));
    expect(decodeEmoji(321, numberEmoji, 4)).toEqual(numberList);
  });
});

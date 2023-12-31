import { emojiToNumber, numberToEmoji, splitEmoji, splitEmojiLines } from "./emoji";

describe("emoji helpers", () => {
  it("should correctly split arrow emojis", () => {
    expect(splitEmoji("🟩🟩🟩🟩⬛⬇️")).toEqual(["🟩", "🟩", "🟩", "🟩", "⬛", "⬇️"]);
  });

  it("should remove white space when splitting emojis", () => {
    expect(splitEmoji("🟩\n🟩 🟩 🟩      ⬛\t\t⬇️")).toEqual(["🟩", "🟩", "🟩", "🟩", "⬛", "⬇️"]);
  });

  it("should correctly split lines of emojis, ignore empty lines", () => {
    const input = `
    1️⃣🟩🟩🟩⬛⬇️

    🟩❌🟩🟩⬛⬇️
    `;
    expect(splitEmojiLines(input)).toEqual([
      ["1️⃣", "🟩", "🟩", "🟩", "⬛", "⬇️"],
      ["🟩", "❌", "🟩", "🟩", "⬛", "⬇️"],
    ]);
  });

  it("should correctly convert number emojis to numbers", () => {
    expect(emojiToNumber(splitEmoji("1️⃣2️⃣3️⃣"))).toEqual(123);
    expect(emojiToNumber(splitEmoji("9️⃣"))).toEqual(9);
  });

  it("should correctly convert numbers to number emojis", () => {
    expect(numberToEmoji(123)).toEqual("1️⃣2️⃣3️⃣");
    expect(numberToEmoji(0)).toEqual("0️⃣");
    expect(numberToEmoji(9000)).toEqual("9️⃣0️⃣0️⃣0️⃣");
    expect(numberToEmoji(0, 5)).toEqual("0️⃣0️⃣0️⃣0️⃣0️⃣");
    expect(numberToEmoji(8, 3)).toEqual("0️⃣0️⃣8️⃣");
  });
});

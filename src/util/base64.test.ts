import { base64ToDateParts, base64ToInt, datePartsToBase64, intToBase64 } from "./base64";

describe("base 64 utils", () => {
  describe("intToBase64", () => {
    it("should convert an integer to base64 string", () => {
      expect(intToBase64(1)).toBe("BAA");
      expect(intToBase64(4096)).toBe("AAB");
      expect(intToBase64(64 ** 3 - 1)).toBe("___");
    });
  });

  describe("base64ToInt", () => {
    it("should convert a base64 string to an integer", () => {
      expect(base64ToInt("BAA")).toBe(1);
      expect(base64ToInt("AAB")).toBe(4096);
      expect(base64ToInt("___")).toBe(64 ** 3 - 1);
    });
  });

  describe("round trip int", () => {
    it(`should round trip 3 digit numbers`, () => {
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          for (let z = 0; z < 10; z++) {
            const i = x * 64 ** 2 + y * 64 + z;
            expect(base64ToInt(intToBase64(i))).toBe(i);
          }
        }
      }
    });

    it(`should round trip with non-default word-widths`, () => {
      expect(base64ToInt(intToBase64(63, 1), 1)).toBe(63);
      expect(base64ToInt(intToBase64(64 ** 3, 4), 4)).toBe(64 ** 3);
    });
  });

  it("should round trip dates", () => {
    for (const date of [
      { year: 1990, month: 1, day: 1 },
      { year: 2023, month: 12, day: 31 },
      { year: 2024, month: 2, day: 29 },
      { year: 2100, month: 1, day: 1 },
    ]) {
      expect(base64ToDateParts(datePartsToBase64(date))).toEqual(date);
    }
  });
});

import mockdate from "mockdate";

import {
  DateParts,
  FIRST_GAME_DATE,
  currentGameNumber,
  signedDayDifference,
  ymd,
  zeroPadDate,
} from "./dateHelpers";

export function setMockDate(dateParts: DateParts) {
  const { yyyy, mm, dd } = zeroPadDate(dateParts);
  mockdate.set(`${yyyy}-${mm}-${dd}T20:00:00.000Z`);
}

describe("dateHelpers", () => {
  it("should return the correct game number", () => {
    setMockDate(FIRST_GAME_DATE);
    expect(currentGameNumber()).toEqual(1);

    // One leap-year later should be 366 days later, resulting in game 367.
    setMockDate(ymd(FIRST_GAME_DATE.year + 1, FIRST_GAME_DATE.month, FIRST_GAME_DATE.day));
    expect(currentGameNumber()).toEqual(367);
  });

  it("should correctly subtract dates", () => {
    expect(
      signedDayDifference({ year: 2023, month: 1, day: 1 }, { year: 2023, month: 1, day: 1 }),
    ).toBe(0);
    expect(
      signedDayDifference({ year: 2023, month: 10, day: 1 }, { year: 2023, month: 11, day: 1 }),
    ).toBe(-31);
    expect(
      signedDayDifference({ year: 2023, month: 11, day: 1 }, { year: 2023, month: 10, day: 1 }),
    ).toBe(31);
  });
});

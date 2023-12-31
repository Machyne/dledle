export type DateParts = {
  year: number;
  month: number;
  day: number;
};

export function ymd(year: number, month: number, day: number): DateParts {
  return { year, month, day };
}
export const FIRST_GAME_DATE: DateParts = ymd(2023, 12, 21);

/*
 * Returns the number of days between two dates (ie `a - b` in days).
 * If a is earlier than b, the result will be negative.
 */
export function signedDayDifference(a: DateParts, b: DateParts): number {
  const aDate = new Date(a.year, a.month - 1, a.day);
  const bDate = new Date(b.year, b.month - 1, b.day);
  return Math.round((aDate.getTime() - bDate.getTime()) / (1000 * 60 * 60 * 24));
}

export function gameNumberForDate(date: DateParts): number {
  // Add 1 because the first game is game 1, not game 0.
  return signedDayDifference(date, FIRST_GAME_DATE) + 1;
}

export function currentGameNumber(): number {
  return gameNumberForDate(currentOfficialDate());
}

export function currentOfficialDate(): DateParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const { year, month, day } = Object.fromEntries(
    formatter.formatToParts(new Date()).map(({ type, value }) => [type, parseInt(value)]),
  );
  return { year, month, day };
}

import fs from "fs";
import path from "path";

import { allGames, validGamesToday } from "./gameList";
import { FIRST_GAME_DATE, ymd } from "./util/dateHelpers";
import { setMockDate } from "./util/dateHelpers.test";

function fileExistsCaseSensitive(filepath: string) {
  const dir = path.dirname(filepath);
  const filenames = fs.readdirSync(dir);
  return filenames.some((fname) => fname === path.basename(filepath));
}

describe("gameList", () => {
  const activeGames = allGames.filter(([, , end]) => !end);
  test("active games should have unique names", () => {
    expect(activeGames.length).toEqual(new Set(activeGames.map((g) => g[0].name)).size);
  });

  test("active games should have unique file names", () => {
    expect(activeGames.length).toEqual(new Set(activeGames.map((g) => g[0].fileName)).size);
  });

  test("active games should have unique links", () => {
    expect(activeGames.length).toEqual(new Set(activeGames.map((g) => g[0].link)).size);
  });

  describe("all games should have image files", () => {
    for (const [game] of allGames) {
      test(game.name, () => {
        expect(
          fileExistsCaseSensitive(`${__dirname}/../static/img/${game.fileName}.png`),
        ).toBeTruthy();
      });
    }
  });

  test("filters games properly", () => {
    setMockDate(ymd(FIRST_GAME_DATE.year - 1, FIRST_GAME_DATE.month, FIRST_GAME_DATE.day));
    expect(validGamesToday()).toEqual([]);
    setMockDate(FIRST_GAME_DATE);
    const launchTitles = [
      "Artle",
      "Costcodle",
      "Framed",
      "GuessTheGame",
      "Listed",
      "Murdle",
      "Nerdle",
      "Tradle",
      "Wordle",
      "Worldle",
    ];
    expect(validGamesToday().map((game) => game.name)).toEqual(launchTitles);
    setMockDate(ymd(2024, 1, 2));
    expect(validGamesToday().map((game) => game.name)).toEqual(
      ["CultureTag", "Swiftle", ...launchTitles].sort(),
    );
    const nextList1 = [
      "CultureTag",
      "Swiftle",
      "Bandle",
      "Gamedle",
      "Factle",
      "Connections",
      "Travle",
      "Birdle",
      "Cloudle",
    ];
    for (const date of [ymd(2024, 4, 8), ymd(2024, 4, 9)]) {
      setMockDate(date);
      expect(validGamesToday().map((game) => game.name)).toEqual(
        launchTitles.concat(nextList1).sort(),
      );
    }
    const nextList2 = ["Betweenle"];
    for (const date of [ymd(2024, 5, 5), ymd(2024, 5, 6)]) {
      setMockDate(date);
      expect(validGamesToday().map((game) => game.name)).toEqual(
        launchTitles.concat(nextList1).concat(nextList2).sort(),
      );
    }
  });
});

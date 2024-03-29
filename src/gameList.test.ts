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
  test("all games should have unique names", () => {
    expect(allGames.length).toEqual(new Set(allGames.map((g) => g[0].name)).size);
  });

  test("all games should have unique file names", () => {
    expect(allGames.length).toEqual(new Set(allGames.map((g) => g[0].fileName)).size);
  });

  test("all games should have unique links", () => {
    expect(allGames.length).toEqual(new Set(allGames.map((g) => g[0].link)).size);
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
  });
});

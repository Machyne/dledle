import seedrandom from "seedrandom";

import { BaseGame } from "./baseGame";
import { Artle } from "./games/artle";
import { Bandle } from "./games/bandle";
import { Betweenle } from "./games/betweenle";
import { Birdle } from "./games/birdle";
import { Cloudle } from "./games/cloudle";
import { Connections } from "./games/connections";
import { Costcodle } from "./games/costcodle";
import { CultureTag } from "./games/cultureTag";
import { Factle } from "./games/factle";
import { Framed } from "./games/framed";
import { Gamedle } from "./games/gamedle";
import { GuessTheGame } from "./games/guessTheGame";
import { Listed } from "./games/listed";
import { Murdle } from "./games/murdle";
import { Nerdle } from "./games/nerdle";
import { Swiftle } from "./games/swiftle";
import { Tradle } from "./games/tradle";
import { Travle } from "./games/travle";
import { V0Birdle } from "./games/v0_birdle";
import { V0Travle } from "./games/v0_travle";
import { Wordle } from "./games/wordle";
import { Worldle } from "./games/worldle";
import {
  DateParts,
  FIRST_GAME_DATE,
  currentGameNumber,
  gameNumberForDate,
  ymd,
} from "./util/dateHelpers";

// A game, date it was released (inclusive), optionally the day it ended (exclusive).
type GameAndDate = [BaseGame, DateParts, DateParts?];
export const allGames: Array<GameAndDate> = [
  [new Artle(), FIRST_GAME_DATE],
  [new Costcodle(), FIRST_GAME_DATE],
  [new Framed(), FIRST_GAME_DATE],
  [new GuessTheGame(), FIRST_GAME_DATE],
  [new Listed(), FIRST_GAME_DATE],
  [new Murdle(), FIRST_GAME_DATE],
  [new Nerdle(), FIRST_GAME_DATE],
  [new Tradle(), FIRST_GAME_DATE],
  [new Wordle(), FIRST_GAME_DATE],
  [new Worldle(), FIRST_GAME_DATE],
  // Added after launch:
  [new CultureTag(), ymd(2024, 1, 2)],
  [new Swiftle(), ymd(2024, 1, 2)],
  [new Bandle(), ymd(2024, 1, 28)],
  [new Gamedle(), ymd(2024, 1, 28)],
  [new Factle(), ymd(2024, 2, 19)],
  [new Connections(), ymd(2024, 2, 19)],
  [new V0Travle(), ymd(2024, 2, 20), ymd(2024, 5, 6)],
  [new V0Birdle(), ymd(2024, 2, 20), ymd(2024, 4, 9)],
  [new Cloudle(), ymd(2024, 2, 20)],
  [new Birdle(), ymd(2024, 4, 9)],
  [new Betweenle(), ymd(2024, 4, 11)],
  [new Travle(), ymd(2024, 5, 6)],
];

export function validGamesToday() {
  return validGamesForGameNumber(currentGameNumber());
}

export function validGamesForGameNumber(gameNumber: number) {
  return allGames
    .filter(
      ([, gameStartDate, gameEndDate]) =>
        gameNumber >= gameNumberForDate(gameStartDate) &&
        (!gameEndDate || gameNumber < gameNumberForDate(gameEndDate)),
    )
    .map(([game]) => game)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * The total number of games that will be played today (including bonus games).
 */
export const GAMES_PER_DAY = 5;

/**
 * The number of misses allowed before calling today's games a loss.
 */
export const ALLOWED_MISSES = 2;

/**
 * A list of games to play today.
 */
export function todaysGames(): Array<BaseGame> {
  const gameNumber = currentGameNumber();
  return gamesForGameNumber(gameNumber);
}

/**
 * A list of games to play for the given game number (can be in the past).
 */
export function gamesForGameNumber(gameNumber: number): Array<BaseGame> {
  const rng = seedrandom("game_seed:" + gameNumber.toString());

  const result: Array<BaseGame> = [];
  const gameOptions = validGamesForGameNumber(gameNumber);
  for (let i = 0; i < GAMES_PER_DAY; ++i) {
    const index = Math.floor(rng() * gameOptions.length);
    result.push(gameOptions[index]);
    gameOptions.splice(index, 1);
  }
  return result;
}

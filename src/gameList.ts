import seedrandom from "seedrandom";

import { BaseGame } from "./baseGame";
import { Artle } from "./games/artle";
import { Costcodle } from "./games/costcodle";
import { Framed } from "./games/framed";
import { GuessTheGame } from "./games/guessTheGame";
import { Listed } from "./games/listed";
import { Murdle } from "./games/murdle";
import { Nerdle } from "./games/nerdle";
import { Tradle } from "./games/tradle";
import { Wordle } from "./games/wordle";
import { Worldle } from "./games/worldle";
import {
  DateParts,
  FIRST_GAME_DATE,
  currentGameNumber,
  gameNumberForDate,
} from "./util/dateHelpers";

// A game and the date it was released.
type GameAndDate = [BaseGame, DateParts];
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
];

export function validGamesToday() {
  return validGamesForGameNumber(currentGameNumber());
}

export function validGamesForGameNumber(gameNumber: number) {
  return allGames
    .filter(([, gameStartDate]) => gameNumber >= gameNumberForDate(gameStartDate))
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

import { GameResult, GameScore } from "../baseGame";
import { GameManager, SKIP } from "../gameManager";
import { el } from "../util/domHelpers";
import { Store } from "./store";

type StatsByGame = {
  wins: number;
  nearWins: number;
  losses: number;
  skips: number;
};

type FullStats = {
  gamesPlayed: number;
  gamesWon: number;
  starWins: number;
  doubleStarWins: number;
  maxWinStreak?: Array<number>;
  currentWinStreak?: Array<number>;
  statsByGame: { [gameName: string]: StatsByGame };
};

function addGameToStatsByGame(statsByGame: FullStats["statsByGame"], gameName: string) {
  if (!statsByGame[gameName]) {
    statsByGame[gameName] = {
      wins: 0,
      nearWins: 0,
      losses: 0,
      skips: 0,
    };
  }
}

function makeStats(completedGames: Array<GameManager>, currentGameNumber: number): FullStats {
  const statsByGame: FullStats["statsByGame"] = {};
  let gamesPlayed: number = 0;
  let gamesWon: number = 0;
  let starWins: number = 0;
  let doubleStarWins: number = 0;
  const streaks: Array<Array<number>> = [];
  let currentStreak: Array<number> = [];

  const pastGames = completedGames.filter((manager) => manager.gameNumber <= currentGameNumber);
  for (const manager of pastGames) {
    // Handle main results
    ++gamesPlayed;
    if (manager.hasWon()) {
      ++gamesWon;
      const winStars = manager.winStars();
      if (winStars === 1) {
        ++starWins;
      } else if (winStars === 2) {
        ++doubleStarWins;
      }
      if (currentStreak.length === 0 || currentStreak.includes(manager.gameNumber - 1)) {
        currentStreak.push(manager.gameNumber);
      } else {
        streaks.push(currentStreak);
        currentStreak = [manager.gameNumber];
      }

      // Handle results by game
      for (const [game, result] of manager.gamesAndResults()) {
        addGameToStatsByGame(statsByGame, game.name);
        const stats = statsByGame[game.name];
        if (result === SKIP) {
          ++stats.skips;
        } else {
          const gr = result as GameResult;
          if (gr.score === GameScore.Win) {
            ++stats.wins;
          } else if (gr.score === GameScore.NearWin) {
            ++stats.nearWins;
          } else {
            ++stats.losses;
          }
        }
      }
    }
  }
  if (currentStreak.length) {
    streaks.push(currentStreak);
  }

  return {
    gamesPlayed,
    gamesWon,
    starWins,
    doubleStarWins,
    maxWinStreak: streaks.reduce(
      (longest, streak) => (streak.length >= (longest?.length ?? 0) ? streak : longest),
      undefined as Array<number> | undefined,
    ),
    currentWinStreak: streaks.find((streak) => streak.includes(currentGameNumber)),
    statsByGame,
  };
}

function makeStreakText(streak?: Array<number>): string {
  if (!streak) {
    return "";
  }
  return `Dledle #${streak[0]}–#${streak[streak.length - 1]}`;
}

export function setupGameStats(currentGameNumber: number) {
  const modal = el("stats-modal");
  if (!modal) {
    return;
  }

  const dataElements = [
    "stats-games-played",
    "stats-games-won",
    "stats-star-wins",
    "stats-double-star-wins",
    "stats-max-win-streak",
    "stats-max-win-streak-text",
    "stats-current-win-streak",
    "stats-current-win-streak-text",
    "stats-dle-table",
  ].map((id) => el(id));
  if (dataElements.some((e) => !e)) {
    return;
  }
  const [
    gamesPlayedTD,
    gamesWonTD,
    starWinsTD,
    doubleStarWinsTD,
    maxWinStreakTD,
    maxWinStreakTextTD,
    currentWinStreakTD,
    currentWinStreakTextTD,
    dleTable,
  ] = dataElements as Array<HTMLElement>;

  const stats = makeStats(Object.values(Store.getCompletedGames()), currentGameNumber);
  gamesPlayedTD.innerHTML = stats.gamesPlayed.toString();
  gamesWonTD.innerHTML = stats.gamesWon.toString();
  starWinsTD.innerHTML = stats.starWins.toString();
  doubleStarWinsTD.innerHTML = stats.doubleStarWins.toString();
  maxWinStreakTD.innerHTML = (stats.maxWinStreak?.length ?? 0).toString();
  maxWinStreakTextTD.innerHTML = makeStreakText(stats.maxWinStreak);
  currentWinStreakTD.innerHTML = (stats.currentWinStreak?.length ?? 0).toString();
  currentWinStreakTextTD.innerHTML = makeStreakText(stats.currentWinStreak);

  for (const child of Array.from(dleTable.children)) {
    if (child.tagName.toLowerCase() === "thead") {
      continue;
    }
    dleTable.removeChild(child);
  }
  Object.entries(stats.statsByGame)
    .sort(([name1], [name2]) => name1.localeCompare(name2))
    .forEach(([gameName, gameStats]) => {
      const row = document.createElement("tr");
      for (const item of [
        gameName,
        gameStats.wins.toString(),
        gameStats.nearWins.toString(),
        gameStats.losses.toString(),
        gameStats.skips.toString(),
        (gameStats.wins + gameStats.nearWins + gameStats.losses + gameStats.skips).toString(),
      ]) {
        const td = document.createElement("td");
        td.innerHTML = item;
        row.appendChild(td);
      }
      dleTable.appendChild(row);
    });
}

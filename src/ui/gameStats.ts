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
  maxPlayStreak?: Array<number>;
  currentPlayStreak?: Array<number>;
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

export function makeStats(
  completedGames: Array<GameManager>,
  currentGameNumber: number,
): FullStats {
  const statsByGame: FullStats["statsByGame"] = {};
  let gamesPlayed: number = 0;
  let gamesWon: number = 0;
  let starWins: number = 0;
  let doubleStarWins: number = 0;
  const winStreaks: Array<Array<number>> = [];
  let currentWinStreak: Array<number> = [];
  const playStreaks: Array<Array<number>> = [];
  let currentPlayStreak: Array<number> = [];

  const pastGames = completedGames.filter((manager) => manager.gameNumber <= currentGameNumber);
  pastGames.sort((a, b) => a.gameNumber - b.gameNumber);
  for (const manager of pastGames) {
    // Handle main results
    ++gamesPlayed;
    if (currentPlayStreak.length === 0 || currentPlayStreak.includes(manager.gameNumber - 1)) {
      currentPlayStreak.push(manager.gameNumber);
    } else {
      playStreaks.push(currentPlayStreak);
      currentPlayStreak = [manager.gameNumber];
    }

    if (manager.hasWon()) {
      ++gamesWon;
      const winStars = manager.winStars();
      if (winStars === 1) {
        ++starWins;
      } else if (winStars === 2) {
        ++doubleStarWins;
      }
      if (currentWinStreak.length === 0 || currentWinStreak.includes(manager.gameNumber - 1)) {
        currentWinStreak.push(manager.gameNumber);
      } else {
        winStreaks.push(currentWinStreak);
        currentWinStreak = [manager.gameNumber];
      }
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
  if (currentPlayStreak.length) {
    playStreaks.push(currentPlayStreak);
  }
  if (currentWinStreak.length) {
    winStreaks.push(currentWinStreak);
  }

  const maxStreak = (longest: Array<number> | undefined, streak: Array<number>) =>
    streak.length >= (longest?.length ?? 0) ? streak : longest;
  const includesCurrent = (streak: Array<number>) => streak.includes(currentGameNumber);
  return {
    gamesPlayed,
    gamesWon,
    starWins,
    doubleStarWins,
    maxPlayStreak: playStreaks.reduce(maxStreak, undefined as Array<number> | undefined),
    currentPlayStreak: playStreaks.find(includesCurrent),
    maxWinStreak: winStreaks.reduce(maxStreak, undefined as Array<number> | undefined),
    currentWinStreak: winStreaks.find(includesCurrent),
    statsByGame,
  };
}

function makeStreakText(streak: Array<number> | undefined, isCurrent: boolean): string {
  if (!streak) {
    return "";
  }
  if (streak.length === 1) {
    return isCurrent ? "(today)" : `Dledle #${streak[0]}`;
  }
  if (isCurrent) {
    return `Since Dledle #${streak[0]}`;
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
    "stats-current-play-streak",
    "stats-current-play-streak-text",
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
    currentPlayStreakTD,
    currentPlayStreakTextTD,
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
  currentPlayStreakTD.innerHTML = (stats.currentPlayStreak?.length ?? 0).toString();
  currentPlayStreakTextTD.innerHTML = makeStreakText(stats.currentPlayStreak, true);
  maxWinStreakTD.innerHTML = (stats.maxWinStreak?.length ?? 0).toString();
  maxWinStreakTextTD.innerHTML = makeStreakText(
    stats.maxWinStreak,
    stats.maxWinStreak?.includes(currentGameNumber) ?? false,
  );
  currentWinStreakTD.innerHTML = (stats.currentWinStreak?.length ?? 0).toString();
  currentWinStreakTextTD.innerHTML = makeStreakText(stats.currentWinStreak, true);

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

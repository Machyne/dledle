import { GameManager } from "../gameManager";
import { Settings, settingsWithDefaults } from "./settings";

type InProgressGameData = {
  numGamesCompleted: number;
  encodedManager: string;
};

type CompletedGames = {
  [gameNumber: number]: {
    encodedManager: string;
  };
};

export class Store {
  static getInProgressGame(currentGameNumber: number) {
    const savedGameData = localStorage.getItem("currentGame");
    if (!savedGameData) {
      return null;
    }
    const gameData = JSON.parse(savedGameData) as InProgressGameData;
    const manager = GameManager.fromEncoded(gameData.encodedManager);
    if (manager.gameNumber !== currentGameNumber) {
      localStorage.removeItem("currentGame");
      return null;
    }
    while (manager.numGamesCompleted() > gameData.numGamesCompleted) {
      manager.undoLastResult();
    }
    return manager;
  }

  static saveInProgressGame(manager: GameManager) {
    const gameData: InProgressGameData = {
      numGamesCompleted: manager.numGamesCompleted(),
      encodedManager: manager.encode(),
    };
    localStorage.setItem("currentGame", JSON.stringify(gameData));
  }

  static saveSettings(settings: Settings) {
    localStorage.setItem("settings", JSON.stringify(settings));
  }

  static getSettings(): Settings {
    const savedSettings = localStorage.getItem("settings");
    if (!savedSettings) {
      return settingsWithDefaults();
    }
    return settingsWithDefaults(JSON.parse(savedSettings));
  }

  static getID(): string | null {
    let id = localStorage.getItem("id") || "";
    if (id) {
      return id;
    }
    try {
      id = crypto.randomUUID();
      localStorage.setItem("id", id);
      return id;
    } catch (e) {
      console.error("could not create id", e);
      return null;
    }
  }

  static hasSentAnalyticsFor(gameNumber: number) {
    const existingSave = localStorage.getItem("sentAnalytics");
    const sentAnalytics = existingSave ? (JSON.parse(existingSave) as Array<number>) : [];
    return sentAnalytics.includes(gameNumber);
  }

  static setSentAnalyticsFor(gameNumber: number) {
    const existingSave = localStorage.getItem("sentAnalytics");
    const sentAnalytics = existingSave ? (JSON.parse(existingSave) as Array<number>) : [];
    sentAnalytics.push(gameNumber);
    localStorage.setItem("sentAnalytics", JSON.stringify(sentAnalytics));
  }

  static isFirstPlay(): boolean {
    return !localStorage.getItem("hasPlayed");
  }

  static markAsPlayed(): void {
    return localStorage.setItem("hasPlayed", "true");
  }

  static saveCompletedGame(manager: GameManager) {
    const existingSave = localStorage.getItem("completedGames");
    const completedGames = existingSave ? (JSON.parse(existingSave) as CompletedGames) : {};
    completedGames[manager.gameNumber] = {
      encodedManager: manager.encode(),
    };
    localStorage.setItem("completedGames", JSON.stringify(completedGames));
  }

  /**
   * Returns a list of all completed games sorted by game number.
   */
  static getCompletedGames(): { [gameNum: string]: GameManager } {
    const existingSave = localStorage.getItem("completedGames");
    const completedGames = existingSave ? (JSON.parse(existingSave) as CompletedGames) : {};
    return Object.fromEntries(
      Object.entries(completedGames).map(([gameNum, { encodedManager }]) => [
        gameNum,
        GameManager.fromEncoded(encodedManager),
      ]),
    );
  }
}

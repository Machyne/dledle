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

  static isFirstPlay(): boolean {
    return !localStorage.getItem("hasPlayed");
  }

  static markAsPlayed(): void {
    return localStorage.setItem("hasPlayed", "true");
  }

  static saveCompletedGame(manager: GameManager) {
    // Save this for now, probably use it for stats later.
    // The encoding is tiny so I'm not concerned about wasting storage.
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
  static getCompletedGames(): Array<GameManager> {
    const existingSave = localStorage.getItem("completedGames");
    const completedGames = existingSave ? (JSON.parse(existingSave) as CompletedGames) : {};
    return Object.entries(completedGames)
      .sort(([gameNumber1], [gameNumber2]) => parseInt(gameNumber1) - parseInt(gameNumber2))
      .map(([, { encodedManager }]) => GameManager.fromEncoded(encodedManager));
  }
}

import { GameManager } from "../gameManager";
import { Settings, settingsWithDefaults } from "./settings";

type InProgressGameData = {
  numGamesCompleted: number;
  encodedManager: string;
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
}

import { GameManager } from "../gameManager";
import { currentGameNumber } from "../util/dateHelpers";
import { addHideListener, elOrThrow, hide, show } from "../util/domHelpers";
import { displayFullScores } from "./displayFullScores";
import { Store } from "./store";

function containsSpoilers(manager: GameManager) {
  const gameNumber = currentGameNumber();
  if (manager.gameNumber !== gameNumber) {
    // Not for today's game, so no spoilers.
    return false;
  }
  const savedGame = Store.getInProgressGame(gameNumber);
  // If the saved game is finished, then the user has already seen the full scores.
  return !savedGame?.isFinished();
}

export function setupShare(share: string) {
  const manager = GameManager.fromEncoded(share);
  const fullScoreContainer = document.querySelector<HTMLDivElement>("#share-modal .shared-scores");
  if (!fullScoreContainer) {
    console.error("No shared scores element");
    return;
  }

  // Check for spoilers and prompt before showing full scores if necessary.
  if (containsSpoilers(manager)) {
    elOrThrow<HTMLButtonElement>("view-spoilers").addEventListener("click", () => {
      show(fullScoreContainer);
      hide("spoiler-warning");
    });
  } else {
    hide("spoiler-warning");
    show(fullScoreContainer);
  }

  // This must exist; the above selector checks for this ID.
  const modal = elOrThrow("share-modal");
  displayFullScores(manager, fullScoreContainer);
  show(modal);
  addHideListener(modal, () => {
    window.location.search = "";
  });
}

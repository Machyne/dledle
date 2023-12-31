import { ALLOWED_MISSES, todaysGames } from "./gameList";
import { GameManager } from "./gameManager";
import { showFullDleList } from "./ui/fullDleList";
import { GameController } from "./ui/gameController";
import { setupModals } from "./ui/modals";
import { setupShare } from "./ui/setupShare";
import { Store } from "./ui/store";
import { currentGameNumber } from "./util/dateHelpers";
import { show } from "./util/domHelpers";

window.addEventListener("DOMContentLoaded", function () {
  setupModals();
  const gc = new GameController();
  const urlParams = new URLSearchParams(window.location.search);
  const share = urlParams.get("share");
  if (share) {
    setupShare(share);
  }
  if (urlParams.get("list")) {
    showFullDleList();
  }
  const games = todaysGames();
  const gameNumber = currentGameNumber();
  let manager = Store.getInProgressGame(gameNumber);
  if (!manager) {
    manager = new GameManager();
    manager.setGames({
      games,
      allowedMisses: ALLOWED_MISSES,
      gameNumber,
    });
  }
  gc.setup(manager);
  // Don't show this on top of the share modal.
  if (!share && Store.isFirstPlay()) {
    show("info-modal");
  }
});

import { ALLOWED_MISSES, todaysGames } from "./gameList";
import { GameManager } from "./gameManager";
import { Analytics } from "./ui/analytics";
import { showFullDleList } from "./ui/fullDleList";
import { GameController } from "./ui/gameController";
import { setupGameStats } from "./ui/gameStats";
import { setupModals } from "./ui/modals";
import { setupShare } from "./ui/setupShare";
import { Store } from "./ui/store";
import { currentGameNumber } from "./util/dateHelpers";
import { el, show } from "./util/domHelpers";

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
  Analytics.sendForToday(gameNumber);
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

  el<HTMLAnchorElement>("stats-link")?.addEventListener("click", (event) => {
    event.preventDefault();
    setupGameStats(gameNumber);
    show("stats-modal");
  });
});

import { BaseGame } from "../baseGame";
import { GameManager } from "../gameManager";
import { baseUrl, el, elOrThrow, hide, show } from "../util/domHelpers";
import { displayFullScores } from "./displayFullScores";
import { Store } from "./store";

export class GameController {
  private manager: GameManager;

  private get currentGame(): BaseGame {
    const cg = this.manager.currentGame();
    if (!cg) {
      throw new Error("No current game");
    }
    return cg;
  }

  private get shareUrl(): string {
    return `${baseUrl()}?share=${this.manager.encode()}`;
  }

  private setCurrentGameNumber() {
    const span = el("game-num");
    if (span) {
      span.innerHTML = this.manager.gameNumber.toString();
    }
  }

  private setGameImage(
    game: BaseGame = this.currentGame,
    index: number = this.manager.numGamesCompleted(),
  ) {
    const gameList = el("game-list");
    const li = gameList?.children[index] as HTMLElement;
    if (!li) {
      return;
    }
    const current = gameList!.getElementsByClassName("current");
    current[0]?.classList.remove("current");
    li.classList.add("current", "revealed");
    li.style.backgroundImage = `url(./static/img/${game.fileName}.png)`;
  }

  private setGameNameAndLink() {
    const span = elOrThrow("next-dle");
    const link = elOrThrow<HTMLAnchorElement>("next-dle-link");
    span.innerHTML = this.currentGame.name;
    link.href = this.currentGame.link;
    link.innerHTML = `Play ${this.currentGame.name}`;
  }

  private setScore() {
    elOrThrow("full-score").innerHTML = this.manager.resultsSoFar();
  }

  private finishGame() {
    const gameOnly = document.getElementsByClassName("game-only");
    for (const el of gameOnly) {
      hide(el);
    }
    if (this.manager.hasWon()) {
      show("win-final");
      hide("win-early");
    } else {
      show("lose-final");
    }
    show("share-container");
  }

  private earlyWin() {
    show("win-early");
    show("share-container");
  }

  private textAreaListener() {
    const textArea = elOrThrow<HTMLTextAreaElement>("dle-results");
    const resultText = textArea.value;
    const match = resultText.match(this.currentGame.resultRegex);
    elOrThrow<HTMLButtonElement>("skip").disabled = !!match;
    elOrThrow<HTMLButtonElement>("submit").disabled = !match;
    if (match || resultText.length < 10) {
      hide("error");
    } else {
      show("error");
    }
  }

  private skipListener() {
    this.manager.skipCurrentGame();
    this.loadCurrentGame();
  }

  private submitListener() {
    const textArea = elOrThrow<HTMLTextAreaElement>("dle-results");
    const resultText = textArea.value;
    const match = resultText.match(this.currentGame.resultRegex);
    if (!match) {
      show("error");
      return;
    }
    try {
      const gameResult = this.currentGame.serializeResult(match);
      this.manager.addNextResult(gameResult);
      this.loadCurrentGame();
    } catch (err) {
      console.error("Error parsing result: ", err);
      show("error");
    }
  }

  private async fullResultsListener() {
    const el = document.querySelector<HTMLDivElement>("#full-results-modal .shared-scores");
    if (!el) {
      console.error("No shared scores element");
      return;
    }
    displayFullScores(this.manager, el, this.shareUrl);
    // This must exist; the above selector checks for this ID.
    show("full-results-modal");
  }

  private async shareListener() {
    const gameNumber = this.manager.gameNumber;
    const guessFraction = this.manager.makeGuessFractionString();
    const shareData = {
      title: `Dledle #${gameNumber}`,
      text: `Dledle #${gameNumber} ${guessFraction}\n${this.manager.resultsSoFar(true)}\n`,
      url: this.shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        navigator.clipboard.writeText(shareData.text + "\n\n" + shareData.url);
        const shareNotifier = elOrThrow("share-notifier");
        shareNotifier.classList.remove("fade-out");
        show(shareNotifier);
        setTimeout(() => {
          shareNotifier.classList.add("fade-out");
          setTimeout(() => {
            hide(shareNotifier);
          }, 500);
        }, 2000);
      }
    } catch (err) {
      console.error("share error", err);
    }
  }

  private loadCurrentGame() {
    Store.saveInProgressGame(this.manager);
    this.setScore();
    if (this.manager.isFinished()) {
      this.finishGame();
      return;
    }
    if (this.manager.hasWon()) {
      this.earlyWin();
    }
    this.setGameImage();
    this.setGameNameAndLink();

    elOrThrow<HTMLTextAreaElement>("dle-results").value = "";
    elOrThrow<HTMLButtonElement>("submit").disabled = true;
  }

  public setup(manager: GameManager) {
    this.manager = manager;
    this.setCurrentGameNumber();
    const gameList = elOrThrow("game-list");
    for (let i = 0; i < manager.numGames(); i++) {
      gameList.appendChild(document.createElement("li"));
    }
    elOrThrow<HTMLTextAreaElement>("dle-results").addEventListener(
      "input",
      this.textAreaListener.bind(this),
    );
    elOrThrow<HTMLButtonElement>("submit").addEventListener(
      "click",
      this.submitListener.bind(this),
    );
    elOrThrow<HTMLButtonElement>("skip").addEventListener("click", this.skipListener.bind(this));
    elOrThrow<HTMLButtonElement>("share").addEventListener("click", this.shareListener.bind(this));
    elOrThrow<HTMLButtonElement>("view-full-results").addEventListener(
      "click",
      this.fullResultsListener.bind(this),
    );
    // Set up images for prior games.
    for (let i = 0; i < this.manager.numGamesCompleted(); i++) {
      this.setGameImage(this.manager.gamesAndResults()[i][0], i);
    }
    this.loadCurrentGame();
  }
}

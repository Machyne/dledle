import { GameResult } from "../baseGame";
import { GameManager, GameResultOrSkip } from "../gameManager";
import { splitEmoji } from "../util/emoji";

export function displayFullScores(
  gameManager: GameManager,
  container: HTMLElement,
  shareLink = "",
) {
  const fullScoreHeader = document.createElement("h2");
  fullScoreHeader.innerHTML = `Dledle #${
    gameManager.gameNumber
  } &nbsp;  ${gameManager.makeGuessFractionString()}${gameManager.makeStreakIndicatorString()}`;
  container.appendChild(fullScoreHeader);
  const fullScore = document.createElement("p");
  const dledleScore = gameManager.resultsSoFar(true);
  fullScore.innerHTML = dledleScore;
  container.appendChild(fullScore);

  const gameEmojis = splitEmoji(dledleScore);
  for (const [game, result] of gameManager.gamesAndResults()) {
    const emoji = gameEmojis.shift();
    const gameContainer = document.createElement("div");
    gameContainer.classList.add("game-container");

    // Game image
    const img = document.createElement("img");
    img.src = `./static/img/${game.fileName}.png`;
    gameContainer.appendChild(img);

    // Link to game
    const header = document.createElement("h3");
    const headerLink = document.createElement("a");
    headerLink.innerHTML = `${emoji} ${game.name}`;
    headerLink.href = game.link;
    headerLink.target = "_blank";
    header.appendChild(headerLink);
    gameContainer.appendChild(header);

    // Score
    const copiedResult = document.createElement("pre");
    if ((result as GameResultOrSkip).isSkip) {
      copiedResult.innerHTML = "<i>⏭️ Skipped</i>";
    } else {
      copiedResult.innerHTML = game.deserialize((result as GameResult).serializedResult);
    }
    gameContainer.appendChild(copiedResult);
    container.appendChild(gameContainer);
  }
  if (shareLink) {
    const share = document.createElement("p");
    share.classList.add("game-container");
    share.innerHTML = `Sharing link: <a class="share-link" href="${shareLink}">${shareLink}</a>`;
    container.appendChild(share);
  }
}

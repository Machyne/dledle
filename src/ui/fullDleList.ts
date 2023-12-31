import { validGamesForGameNumber } from "../gameList";
import { addHideListener, el, show } from "../util/domHelpers";

export function showFullDleList() {
  const ul = el<HTMLUListElement>("full-dle-list");
  const modal = el("dle-list-modal");
  if (!ul || !modal) {
    return;
  }
  ul.innerHTML = "";
  for (const game of validGamesForGameNumber(9999999)) {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = game.link;
    link.textContent = game.name;
    li.appendChild(link);
    ul.appendChild(li);
  }
  show(modal);
  addHideListener(modal, () => {
    window.location.search = "";
  });
}

import { el, hide, show } from "../util/domHelpers";

export function setupModals() {
  document.querySelectorAll(".modal .close").forEach((button: HTMLAnchorElement) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      hide(button.closest(".modal"));
    });
  });

  document.querySelectorAll(".modal").forEach((modal: HTMLDivElement) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        hide(modal);
      }
    });
  });

  el<HTMLAnchorElement>("info-link")?.addEventListener("click", (event) => {
    event.preventDefault();
    show("info-modal");
  });

  el<HTMLAnchorElement>("settings-link")?.addEventListener("click", (event) => {
    event.preventDefault();
    show("settings-modal");
  });
}

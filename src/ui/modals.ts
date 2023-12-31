import { elOrThrow, hide, show } from "../util/domHelpers";

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

  elOrThrow<HTMLAnchorElement>("info-link").addEventListener("click", (event) => {
    event.preventDefault();
    show("info-modal");
  });

  elOrThrow<HTMLAnchorElement>("settings-link").addEventListener("click", (event) => {
    event.preventDefault();
    show("settings-modal");
  });
}

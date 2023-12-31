export function baseUrl() {
  let port = window.location.port;
  if (port) {
    port = ":" + port;
  }
  return window.location.protocol + "//" + window.location.hostname + port + "/";
}

export function el<T extends HTMLElement = HTMLElement>(id: string): T | null {
  const e = document.getElementById(id) as T | null;
  if (!e) {
    console.error(`No element with id ${id}`);
  }
  return e;
}

export function elOrThrow<T extends HTMLElement = HTMLElement>(id: string): T {
  const e = document.getElementById(id) as T | null;
  if (!e) {
    throw new Error(`No element with id ${id}`);
  }
  return e;
}

export function show(elementOrID: string | Element | null) {
  if (!elementOrID) {
    return;
  }
  if (typeof elementOrID === "string") {
    elementOrID = elOrThrow(elementOrID);
  }
  elementOrID.classList.remove("hidden");
}

export function hide(elementOrID: string | Element | null) {
  if (!elementOrID) {
    return;
  }
  if (typeof elementOrID === "string") {
    elementOrID = elOrThrow(elementOrID);
  }
  elementOrID.classList.add("hidden");
}

export function addHideListener(element: Element, callback: () => void) {
  let wasHidden = element.classList.contains("hidden");
  const attrObserver = new MutationObserver((mutations) => {
    mutations.forEach((mu) => {
      if (mu.type !== "attributes" && mu.attributeName !== "class") return;
      const currentlyHidden = element.classList.contains("hidden");
      if (!wasHidden && currentlyHidden) {
        callback();
      }
      wasHidden = currentlyHidden;
    });
  });
  attrObserver.observe(element, { attributes: true });
}

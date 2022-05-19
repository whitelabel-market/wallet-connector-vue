export function getOrCreatePortal(id: string): HTMLElement {
  let element = document.getElementById(id);

  if (element) return element;

  element = document.createElement("div");
  element.setAttribute("id", id);
  return document.body.appendChild(element);
}

export function* genId() {
  let index = 0;
  while (true) yield index++;
}

export function parseChainId(chainId: string | number) {
  return typeof chainId === "number"
    ? chainId
    : Number.parseInt(chainId, chainId.startsWith("0x") ? 16 : 10);
}

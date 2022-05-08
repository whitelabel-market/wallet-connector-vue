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

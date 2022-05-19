import type { Ref } from "vue-demi";
import { ref } from "vue-demi";
import type { ConfigurableWindow, ConfigurableDocument } from "@vueuse/core";
import { defaultWindow, useEventListener, defaultDocument } from "@vueuse/core";

type ConfigurableDocumentVisibility = ConfigurableDocument & {
  hidden?: boolean;
  msHidden?: boolean;
  webkitHidden?: boolean;
};

enum VisibilityChange {
  DEFAULT = "visibilitychange",
  MS = "msvisibilitychange",
  WEBKIT = "webkitvisibilitychange",
}

enum Hidden {
  DEFAULT = "hidden",
  MS = "msHidden",
  WEBKIT = "webkitHidden",
}

const STR_UNDEFINED = "undefined";

/**
 * Reactively track window activeness with `visibilitychange` and
 * `window.onfocus` and `window.onblur` event listener.
 * Alternative to useWindowFocus which only tracks if window is focused.
 *
 * @see https://vueuse.org/useWindowFocus
 */
export function useWindowActive(
  fallback = true,
  { window = defaultWindow }: ConfigurableWindow = {},
  { document = defaultDocument }: ConfigurableDocumentVisibility = {}
): Ref<boolean> {
  if (!window) return ref(fallback);
  if (!document) return ref(fallback);

  let hidden: keyof ConfigurableDocumentVisibility = Hidden.DEFAULT,
    visibilityChange: string = VisibilityChange.DEFAULT;
  if (
    typeof (document as ConfigurableDocumentVisibility)?.msHidden !==
    STR_UNDEFINED
  ) {
    hidden = Hidden.MS;
    visibilityChange = VisibilityChange.MS;
  } else if (
    typeof (document as ConfigurableDocumentVisibility)?.webkitHidden !==
    STR_UNDEFINED
  ) {
    hidden = Hidden.WEBKIT;
    visibilityChange = VisibilityChange.WEBKIT;
  }

  if (
    typeof document.addEventListener === "undefined" ||
    typeof (document as ConfigurableDocumentVisibility)[hidden] === "undefined"
  )
    return ref(fallback);

  const active = ref<boolean>(
    !(document as ConfigurableDocumentVisibility)[hidden]
  );

  useEventListener(document, visibilityChange, () => {
    if ((document as ConfigurableDocumentVisibility)[hidden]) {
      active.value = false;
    } else {
      active.value = true;
    }
  });

  useEventListener(window, "blur", () => {
    active.value = false;
  });

  useEventListener(window, "focus", () => {
    active.value = true;
  });

  return active;
}

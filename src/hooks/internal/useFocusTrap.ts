import type { ConfigurableDocument, MaybeElementRef } from "@vueuse/core";
import { defaultDocument, unrefElement, useEventListener } from "@vueuse/core";
import { computed, nextTick } from "vue-demi";
import { Keys } from "../../keyboard";

const FOCUSABLE_ELEMENTS_QUERY =
  "button:not([disabled]), " +
  "select:not([disabled]), " +
  "a[href]:not([disabled]), " +
  "area[href]:not([disabled]), " +
  '[contentEditable=""]:not([disabled]), ' +
  '[contentEditable="true"]:not([disabled]), ' +
  '[contentEditable="TRUE"]:not([disabled]), ' +
  "textarea:not([disabled]), " +
  "iframe:not([disabled]), " +
  "input:not([disabled]), " +
  "summary:not([disabled]), " +
  '[tabindex]:not([tabindex="-1"])';

export interface FocusTrapOptions extends ConfigurableDocument {}

/**
 * Focus trap behavior based on https://www.w3.org/TR/wai-aria-practices-1.1/#keyboard-interaction-7
 * Focuses first focusable element inside target and keeps focus between all focusable elements
 *
 * @param target
 * @param options
 */
export function useFocusTrap(
  target: MaybeElementRef,
  options: FocusTrapOptions = {}
): void {
  const { document = defaultDocument } = options;

  if (!document) return;

  const focusableElements = Array.from<HTMLElement>(
    unrefElement(target)?.querySelectorAll(FOCUSABLE_ELEMENTS_QUERY) ?? []
  );

  if (!focusableElements.length) return;

  const firstFocusable = computed<HTMLElement>(() => focusableElements[0]);
  const lastFocusable = computed<HTMLElement>(
    () => focusableElements[focusableElements.length - 1]
  );

  // initially focus first item
  nextTick(() => firstFocusable.value.focus());

  useEventListener(unrefElement(target), "keydown", (e: KeyboardEvent) => {
    if (
      document.activeElement === lastFocusable.value &&
      e.key === Keys.Tab &&
      !e.shiftKey
    ) {
      e.preventDefault();
      nextTick(() => firstFocusable.value?.focus());
    }
    if (
      document.activeElement === firstFocusable.value &&
      e.key === Keys.Tab &&
      e.shiftKey
    ) {
      e.preventDefault();
      nextTick(() => lastFocusable.value?.focus());
    }
  });
}

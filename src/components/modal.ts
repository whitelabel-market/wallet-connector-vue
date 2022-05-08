/* eslint-disable vue/one-component-per-file */
import {
  Teleport,
  computed,
  defineComponent,
  h,
  onMounted,
  onUnmounted,
  provide,
  ref,
  watch,
} from "vue-demi";
import type { InjectionKey, Ref } from "vue-demi";
import type { MaybeElement } from "@vueuse/core";
import { onClickOutside, unrefElement, useEventListener } from "@vueuse/core";
import { useContext } from "../hooks";
import { Keys } from "../keyboard";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { genId, getOrCreatePortal } from "../utils";

export interface ModalInterface {
  // Modal state
  open: Ref<boolean>;
  title: Ref<string | null>;
  modalContent: Ref<MaybeElement | null>;

  // id generators
  contentIdGenerator: Generator;
  titleIdGenerator: Generator;
  buttonIdGenerator: Generator;

  // state modifiers
  setTitle(id: string | null): void;
  close(): void;
}

export const ConnectContext = Symbol(
  "ConnectContext"
) as InjectionKey<ModalInterface>;

export interface ConnectModalProps {
  /**
   * Determines the html element
   *
   * @default 'div'
   */
  as?: string | object;

  /**
   * Specify if modal should unmount from DOM when not visible
   *
   * @default true
   */
  unmount?: boolean;

  /**
   * Used to hide or show the modal
   *
   * @default false
   */
  show: boolean | string;
}

export const ConnectModal = defineComponent<ConnectModalProps>({
  name: "ConnectModal",
  inheritAttrs: false,
  props: {
    as: { type: [Object, String], default: "div" },
    unmount: { type: Boolean, default: true },
    show: { type: [Boolean, String], default: "missing" },
  } as unknown as undefined,
  emits: {
    close: (_close: boolean) => true,
    open: (_open: boolean) => true,
  },
  setup(props, { emit, attrs, slots }) {
    const id = `connect-modal-${genId().next().value}`;

    const open = computed<boolean>(() => props.show as boolean);

    if (props.show === "missing")
      throw new Error(
        "[ConnectModal]: You forgot to provide a `show` prop to the `ConnectModal`."
      );

    if (typeof props.show !== "boolean") {
      throw new TypeError(
        `[ConnectModal]: You provided a \`show\` prop to the \`ConnectModal\`, but the value is not a boolean. Received: ${props.show}`
      );
    }

    const portalElement: MaybeElement = getOrCreatePortal(
      `connect-modal-portal-${genId().next().value}`
    );
    const modalRef = ref<MaybeElement>(null);
    const title = ref<ModalInterface["title"]["value"]>(null);
    const modalAnchor = ref<MaybeElement>(portalElement);

    const modalInterface: ModalInterface = {
      title,
      modalContent: ref(null),
      open,
      contentIdGenerator: genId(),
      titleIdGenerator: genId(),
      buttonIdGenerator: genId(),
      setTitle(id: string) {
        if (title.value === id) return;
        title.value = id;
      },
      close() {
        emit("close", false);
      },
    };

    provide(ConnectContext, modalInterface);

    // close modal on escape
    useEventListener(window, "keydown", (e: KeyboardEvent) => {
      if (e.key !== Keys.Escape || !open.value) return;
      e.preventDefault();
      e.stopPropagation();
      modalInterface.close();
    });

    // close modal on outside click
    onClickOutside(modalInterface.modalContent, (e: MouseEvent) => {
      e.stopPropagation();
      modalInterface.close();
    });

    // watch modal container to use focus trap
    watch(
      () => unrefElement(modalInterface.modalContent.value),
      () => {
        if (open.value) useFocusTrap(modalInterface.modalContent.value);
      }
    );

    return () => {
      const elementProps = {
        id,
        ...attrs,
        ref: modalRef,
        role: "dialog",
        "aria-modal": open.value ? true : undefined,
        "aria-labelledby": title.value,
      };

      const children = slots.default?.({ open: open.value });

      return !open.value
        ? null
        : h(
            Teleport,
            { to: modalAnchor.value },
            h(props.as as string, { ...elementProps }, children)
          );
    };
  },
});

export interface ConnectContentProps {
  /**
   * Determines the html element
   *
   * @default 'div'
   */
  as?: string | object;
}

export const ConnectContent = defineComponent<ConnectContentProps>({
  name: "ConnectContent",
  props: {
    as: { type: [Object, String], default: "div" },
  } as unknown as undefined,
  setup(props, { slots }) {
    const name = "ConnectContent";
    const modalInterface = useContext(ConnectContext, name) as ModalInterface;
    const id = `connect-content-${
      modalInterface.contentIdGenerator.next().value
    }`;

    return () => {
      const elementProps = {
        id,
        ref: modalInterface.modalContent,
      };

      const children = slots.default?.({ open: modalInterface.open });

      return h(props.as as string, { ...elementProps }, children);
    };
  },
});

export interface ConnectTitleProps {
  /**
   * Determines the html element
   *
   * @default 'h2'
   */
  as?: string | object;
}

export const ConnectTitle = defineComponent<ConnectTitleProps>({
  name: "ConnectTitle",
  props: {
    as: { type: [Object, String], default: "h2" },
  } as unknown as undefined,
  setup(props, { slots }) {
    const name = "ConnectTitle";
    const modalInterface = useContext(ConnectContext, name) as ModalInterface;
    const id = `connect-title-${modalInterface.titleIdGenerator.next().value}`;

    onMounted(() => {
      modalInterface.setTitle(id);
      onUnmounted(() => modalInterface.setTitle(null));
    });

    return () => {
      const elementProps = { id };

      const children = slots.default?.({ open: modalInterface.open });

      return h(props.as as string, { ...elementProps }, children);
    };
  },
});

export interface ConnectButtonProps {
  /**
   * Determines the html element
   *
   * @default 'button'
   */
  as?: string | object;
  /**
   * Enables or disables the button
   *
   * @default false
   */
  disabled?: boolean;
}

export const ConnectButton = defineComponent<ConnectButtonProps>({
  name: "ConnectButton",
  props: {
    as: { type: [Object, String], default: "button" },
    disabled: { type: Boolean, default: false },
  } as unknown as undefined,
  emits: { click: (_click: boolean) => true },
  setup(props, { emit, slots }) {
    const name = "ConnectButton";
    const modalInterface = useContext(ConnectContext, name) as ModalInterface;
    const id = `connect-button-${
      modalInterface.buttonIdGenerator.next().value
    }`;

    const hover = ref<boolean>(false);
    const active = ref<boolean>(false);

    useEventListener(window, "keydown", (e: KeyboardEvent) => {
      if (
        (e.key !== Keys.Enter && e.key !== Keys.Space) ||
        !modalInterface.open.value
      )
        return;
      e.preventDefault();
      e.stopPropagation();
      modalInterface.close();
    });

    const onMouseEnter = () => {
      if (props.disabled) return;
      hover.value = true;
    };

    const onMouseLeave = () => {
      if (props.disabled) return;
      hover.value = false;
    };

    const onFocus = () => {
      if (props.disabled) return;
      active.value = true;
    };

    const onBlur = () => {
      if (props.disabled) return;
      active.value = false;
    };

    const handleClick = (e: MouseEvent) => {
      if (props.disabled) return;
      e.preventDefault();
      e.stopPropagation();
      emit("click", true);
      modalInterface.close();
    };

    return () => {
      const elementProps = {
        id,
        role: "button",
        tabindex:
          props.disabled === true
            ? undefined
            : props.as !== "button"
            ? "0"
            : undefined,
        "aria-disabled": props.disabled === true ? true : undefined,
        onpointermove: onMouseEnter,
        onmousemove: onMouseEnter,
        onpointerleave: onMouseLeave,
        onmouseleave: onMouseLeave,
        onfocus: onFocus,
        onblur: onBlur,
        onclick: handleClick,
      };

      const children = slots.default?.({
        open: modalInterface.open,
        hover,
        active,
      });

      return h(props.as as string, { ...elementProps }, children);
    };
  },
});

import { watch, ref, shallowRef, readonly, onBeforeUnmount } from "vue-demi";
import type { Ref, ShallowRef } from "vue-demi";
import { useWallet } from "../hooks/useWallet";
import { useWindowActive } from "../hooks/internal/useWindowActive";
import { createEventHook, until } from "@vueuse/core";
import type { EventHookOn } from "@vueuse/core";
import type { Block, ProviderMessage } from "../types";
import { RpcMethods } from "../types";

const STR_OBJECT = "object";

export interface UseBlockReturn {
  /**
   * The block response
   */
  block: ShallowRef<Block | undefined>;

  /**
   * Any errors that may have occurred
   */
  error: Ref<Error | undefined>;

  /**
   * Stating if initial request is finished
   */
  isFinished: Ref<boolean>;

  /**
   * Manually get new Block
   */
  execute: () => Promise<any>;

  /**
   * Fires after a new Block is created
   */
  onNewBlock: EventHookOn<Block>;

  /**
   * Fires after an error occured on new Block creation
   */
  onNewBlockError: EventHookOn<Error>;
}

export interface UseBlockOptions {
  /**
   * Will automatically get new Block when `useBlock` is used
   *
   * @default true
   */
  immediate?: boolean;
  /**
   * Will subscribe to new Blocks
   *
   * @default false
   */
  useSubscriptions?: boolean;
}

export function useBlock(): UseBlockReturn;
export function useBlock(
  useBlockOptions: UseBlockOptions
): UseBlockReturn & PromiseLike<UseBlockReturn>;

export function useBlock(
  ...args: any[]
): UseBlockReturn & PromiseLike<UseBlockReturn> {
  let options: UseBlockOptions = {
    immediate: true,
    useSubscriptions: false,
  };

  if (args.length > 0) {
    if (["immediate", "useSubscriptions"].some((k) => k in args[0]))
      options = { ...options, ...args[0] };
  }

  const newBlockEvent = createEventHook<Block>();
  const newBlockErrorEvent = createEventHook<Error>();

  const { provider, activeChainId } = useWallet();
  const windowActive = useWindowActive();

  const block = shallowRef<Block>();
  const error = ref<Error>();
  const isFinished = ref(false);
  let subscriptionId: string;

  const subscribe = async () => {
    if (subscriptionId) unsubscribe();
    subscriptionId = (await provider.value?.request({
      method: RpcMethods.SUBSCRIBE,
      params: ["newHeads"],
    })) as string;
    console.log(subscriptionId);
  };

  const unsubscribe = async () => {
    await provider.value?.request({
      method: RpcMethods.UNSUBSCRIBE,
      params: [subscriptionId],
    });
  };

  const execute = async () => {
    console.log("execute");
    return new Promise<Block | null>((resolve, reject) => {
      provider.value
        ?.request({
          method: "eth_getBlockByNumber",
          params: ["latest", false],
        })
        .then((res: any) => {
          console.log(res);
          if (typeof res === STR_OBJECT) {
            block.value = {
              difficulty: res.difficulty,
              extraData: res.extraData,
              gasLimit: res.gasLimit,
              gasUsed: res.gasUsed,
              hash: res.hash,
              logsBloom: res.logsBloom,
              miner: res.miner,
              mixHash: res.mixHash,
              nonce: res.nonce,
              number: res.number,
              parentHash: res.parentHash,
              receiptsRoot: res.receiptsRoot,
              sha3Uncles: res.sha3Uncles,
              stateRoot: res.stateRoot,
              timestamp: res.timestamp,
              transactionsRoot: res.transactionsRoot,
            };
            newBlockEvent.trigger(block.value as Block);
            return resolve(block.value);
          }
        })
        .catch((e: any) => {
          error.value = new Error("No result available in new Block.");
          newBlockErrorEvent.trigger(error.value);
          return reject(error.value);
        })
        .finally(() => {
          isFinished.value = true;
        });
    });
  };

  watch(provider, () => {
    if (!options.useSubscriptions) return;
    provider.value?.on("message", (message: ProviderMessage) => {
      if (message.type === "eth_subscription") {
        const { data } = message as any;
        console.log(data.subscription);
        if (data.subscription === subscriptionId) {
          if (typeof data?.result === STR_OBJECT) {
            block.value = data.result;
            newBlockEvent.trigger(block.value as Block);
          } else {
            error.value = new Error("No result available in new Block.");
            newBlockErrorEvent.trigger(error.value);
          }
        }
      }
    });
  });

  watch([activeChainId, windowActive], async () => {
    if (!options.useSubscriptions) return;
    if (windowActive.value && activeChainId.value) subscribe();
    else unsubscribe();
  });

  onBeforeUnmount(async () => {
    if (!options.useSubscriptions) return;
    unsubscribe();
  });

  const blockReturn: UseBlockReturn = {
    block: readonly(block),
    error: readonly(error),
    isFinished: readonly(isFinished),
    execute,
    onNewBlock: newBlockEvent.on,
    onNewBlockError: newBlockErrorEvent.on,
  };

  function waitUntilFinished() {
    return new Promise<UseBlockReturn>((resolve, reject) => {
      until(isFinished)
        .toBe(true)
        .then(() => resolve(blockReturn))
        .catch((error: any) => reject(error));
    });
  }

  if (options.immediate) setTimeout(execute, 0);

  return {
    ...blockReturn,
    then(onFulfilled, onRejected) {
      return waitUntilFinished().then(onFulfilled, onRejected);
    },
  };
}

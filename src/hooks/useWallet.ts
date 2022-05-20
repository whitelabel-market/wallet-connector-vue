import {
  inject,
  computed,
  ref,
  watch,
  shallowRef,
  toRaw,
  readonly,
} from "vue-demi";
import type { Ref, ShallowRef, WatchOptions } from "vue-demi";
import { parseChainId } from "../utils";
import { Connector } from "@whitelabel-solutions/wallet-connector";
import type { IProvider } from "@whitelabel-solutions/wallet-connector";
import type {
  Ethereumish,
  ProviderRpcError,
  ProviderConnectInfo,
} from "../types";
import { createEventHook } from "@vueuse/core";
import type { EventHookOn } from "@vueuse/core";

export const WALLET_CONTEXT = Symbol();

export interface Wallet {
  // state
  address: Ref<string>;
  loading: Ref<boolean>;
  activeChainId: Ref<number | undefined>;
  err: Ref<ProviderRpcError | undefined>;
  isConnected: Ref<boolean>;
  isWrongNetwork: Ref<boolean>;

  // shortcuts to useful instances
  provider: ShallowRef<Ethereumish | undefined>;

  // action methods
  connect: (_provider: IProvider) => Promise<void>;
  disconnect: () => void;
  onConnected: EventHookOn<Ethereumish>;
  onDisconnected: EventHookOn;
  onAccountsChanged: EventHookOn<string>;
  onChainChanged: EventHookOn<number>;
}

// tslint:disable-next-line:no-empty-interface
export interface WalletOptions extends WatchOptions {}

export function createWallet(
  connectorOptions: any = {
    appName: "App Name",
    infuraId: "",
    chainId: 1,
    authereum: { key: "" }, // Yet required (but unused) in ConnectorUserOptions type
    fortmatic: { key: "" }, // Yet required (but unused) in ConnectorUserOptions type
  },
  walletOptions: WalletOptions = {}
): Wallet {
  const { flush = "pre", immediate = false } = walletOptions;

  // event hooks
  const connectedEvent = createEventHook<Ethereumish>();
  const disconnectedEvent = createEventHook();
  const accountsChangedEvent = createEventHook<string>();
  const chainChangedEvent = createEventHook<number>();

  // state
  const address = ref<string>("");
  const loading = ref<boolean>(false);
  const activeChainId = ref<number>();
  const err = ref<ProviderRpcError>();
  const isConnected = computed<boolean>(
    () => !!provider.value && !!address.value
  );
  const isWrongNetwork = computed<boolean>(() =>
    !activeChainId.value
      ? false
      : activeChainId.value === connectorOptions.chainId
  );

  // useful instances
  const provider = shallowRef<Ethereumish>();

  // methods
  const connect = async (_provider: IProvider): Promise<void> => {
    loading.value = true;
    try {
      Connector.init(connectorOptions);
      provider.value = toRaw(await _provider.connect()) as Ethereumish;
      connectedEvent.trigger(provider.value);
    } catch (e: any) {
      loading.value = false;
      throw new Error(e.message);
    }
  };

  const disconnect = async (): Promise<void> => {
    provider.value?.removeAllListeners();
    [
      address.value,
      loading.value,
      activeChainId.value,
      err.value,
      provider.value,
    ] = ["", false, undefined, undefined, undefined];
    disconnectedEvent.trigger(undefined);
  };

  const connectListener = ({ chainId }: ProviderConnectInfo): void => {
    activeChainId.value = chainId ? parseChainId(chainId) : -1;
  };

  const disconnectListener = (error: ProviderRpcError): void => {
    err.value = error ? error : undefined;
  };

  const chainChangedListener = (chainId: string): void => {
    activeChainId.value = chainId ? parseChainId(chainId) : -1;
    chainChangedEvent.trigger(activeChainId.value);
  };

  const accountsChangedListener = (accounts: string[]): void => {
    address.value = Array.isArray(accounts) ? accounts?.[0] : "";
    accountsChangedEvent.trigger(address.value);
  };

  const addEventListener = (): void => {
    provider.value?.on("connect", connectListener);
    provider.value?.on("disconnect", disconnectListener);
    provider.value?.on("chainChanged", chainChangedListener);
    provider.value?.on("accountsChanged", accountsChangedListener);
  };

  // reload address and network on connect
  watch(
    provider,
    (): void => {
      if (provider.value) {
        addEventListener();
        address.value = provider.value.selectedAddress;
        activeChainId.value = parseChainId(provider.value?.chainId as string);
      }
      loading.value = false;
    },
    { flush, immediate }
  );

  const wallet: Wallet = {
    address: readonly(address),
    loading: readonly(loading),
    activeChainId: readonly(activeChainId),
    err: readonly(err),
    isConnected: readonly(isConnected),
    isWrongNetwork: readonly(isWrongNetwork),
    provider,
    connect,
    disconnect,
    onConnected: connectedEvent.on,
    onDisconnected: disconnectedEvent.on,
    onAccountsChanged: accountsChangedEvent.on,
    onChainChanged: chainChangedEvent.on,
  };

  return wallet;
}

export function useWallet(): Wallet {
  const context = inject(WALLET_CONTEXT) as Wallet;

  if (!context) {
    throw new Error(
      `[💰]: useWallet was called with no active Wallet. Did you forget to install the Plugin?\n` +
        `\tapp.use(WalletConnectorVue, options)`
    );
  }

  return context;
}

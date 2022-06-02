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
import { Connector, Providers } from "@whitelabel-solutions/wallet-connector";
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
  error: Ref<ProviderRpcError | undefined>;
  isConnected: Ref<boolean>;
  shortAddress: Ref<string>;

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
  const error = ref<ProviderRpcError>();
  const isConnected = computed<boolean>(
    () => !!provider.value && !!address.value
  );
  const shortAddress = computed<string>(
    () => address.value?.slice(0, 4) + "..." + address.value?.slice(-4)
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
      error.value,
      provider.value,
    ] = ["", false, undefined, undefined, undefined];
    localStorage.removeItem("CACHED_PROVIDER");
    disconnectedEvent.trigger(undefined);
  };

  const connectListener = ({ chainId }: ProviderConnectInfo): void => {
    activeChainId.value = chainId ? parseChainId(chainId) : -1;
  };

  const disconnectListener = (err: ProviderRpcError): void => {
    error.value = err ? err : undefined;
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
        error.value = undefined;
        addEventListener();
        address.value = provider.value.selectedAddress;
        activeChainId.value = parseChainId(provider.value?.chainId as string);
      }
      loading.value = false;
    },
    { flush, immediate }
  );

  if (window) {
    const id = JSON.parse(localStorage.getItem("CACHED_PROVIDER") as string);
    const providers: any = Providers;
    const p: any = Object.keys(providers)
      .map((key: any) => providers[key as any] as any)
      .find((provider) => provider.id === id);
    if (p) connect(p);
  }

  const wallet: Wallet = {
    address: readonly(address),
    loading: readonly(loading),
    activeChainId: readonly(activeChainId),
    error: readonly(error),
    isConnected: readonly(isConnected),
    shortAddress: readonly(shortAddress),
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

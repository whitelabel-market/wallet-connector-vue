import { inject, computed, ref, watch, shallowRef, toRaw } from "vue-demi";
import type { Ref, ShallowRef } from "vue-demi";
import { parseChainId } from "../utils";
import { IProvider } from "@whitelabel-solutions/wallet-connector";
import type { Provider, RpcError, ConnectInfo } from "../types";

export const WALLET_CONTEXT = Symbol();

export interface Wallet {
  // state
  address: Ref<string>;
  accounts: Ref<string[]>;
  loading: Ref<boolean>;
  chainId: Ref<number>;
  balance: Ref<number>;
  isConnected: Ref<boolean>;
  error: Ref<RpcError | undefined>;

  // shortcuts to useful instances
  provider: ShallowRef<Provider | undefined>;

  // action methods
  connect: (_provider: IProvider) => Promise<void>;
  disconnect: () => void;
}

export function createWallet(): Wallet {
  // state
  const address = ref<string>("");
  const accounts = ref<string[]>([]);
  const loading = ref<boolean>(false);
  const chainId = ref<number>(-1);
  const balance = ref<number>(0);
  const isConnected = computed<boolean>(
    () => (!!provider.value && address.value) as boolean
  );
  const error = ref<RpcError>();

  // useful instances
  const provider = shallowRef<Provider>();

  // methods
  const connect = async (_provider: IProvider): Promise<void> => {
    loading.value = true;
    try {
      provider.value = toRaw(await _provider.connect()) as Provider;
    } catch (e: any) {
      loading.value = false;
      throw new Error(e.message);
    }
  };

  const disconnect = async (): Promise<void> => {
    removeEventListener();
    provider.value?.disconnect();
    [
      address.value,
      accounts.value,
      loading.value,
      chainId.value,
      balance.value,
      error.value,
      provider.value,
    ] = ["", [], false, -1, 0, undefined, undefined];
  };

  const connectListener = ({ chainId: _chainId }: ConnectInfo): void => {
    if (chainId) chainId.value = parseChainId(_chainId);
  };

  const disconnectListener = (_error: RpcError): void => {
    if (_error) error.value = _error;
  };

  const chainChangedListener = (_chainId: string): void => {
    if (chainId) chainId.value = parseChainId(_chainId);
  };

  const accountsChangedListener = (_accounts: string[]): void => {
    if (_accounts.length) {
      accounts.value = _accounts;
      address.value = _accounts[0];
    }
  };

  const addEventListener = (): void => {
    provider.value?.on("connect", connectListener);
    provider.value?.on("disconnect", disconnectListener);
    provider.value?.on("chainChanged", chainChangedListener);
    provider.value?.on("accountsChanged", accountsChangedListener);
  };

  const removeEventListener = (): void => {
    provider.value?.off("connect", connectListener);
    provider.value?.off("disconnect", disconnectListener);
    provider.value?.off("chainChanged", chainChangedListener);
    provider.value?.off("accountsChanged", accountsChangedListener);
  };

  // reload address and network on connect
  watch(provider, (): void => {
    // await connect()?
    addEventListener();
    loading.value = false;
  });

  const wallet: Wallet = {
    address,
    accounts,
    loading,
    chainId,
    balance,
    isConnected,
    provider,
    error,
    connect,
    disconnect,
  };

  return wallet;
}

export function useWallet(): Wallet {
  const context = inject(WALLET_CONTEXT) as Wallet;

  if (!context) {
    throw new Error("useWallet must be used with useWalletProvider");
  }

  return context;
}

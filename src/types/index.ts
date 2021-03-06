export enum RpcMethods {
  // EIP-747
  WATCH_ASSET = "wallet_watchAsset",
  // EIP-758
  SUBSCRIBE = "eth_subscribe",
  UNSUBSCRIBE = "eth_unsubscribe",
  // EIP-1193
  REQUEST_ACCOUNTS = "eth_requestAccounts",
  // EIP-3085
  ADD_CHAIN = "wallet_addEthereumChain",
  // EIP-3326
  SWITCH_CHAIN = "wallet_switchEthereumChain",
}

// per EIP-1193
export interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

// per EIP-1193
export interface ProviderConnectInfo {
  readonly chainId: string;
}

// per EIP-1193
export interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}

// per EIP-3085
// Interface for adding a new Ethereum chain to the wallet
export interface AddEthereumChainParameter {
  chainId: string;
  blockExplorerUrls?: string[];
  chainName?: string;
  iconUrls?: string[];
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls?: string[];
}

// per EIP-3326
export interface SwitchEthereumChainParameter {
  chainId: string;
}

// per EIP-747
// Interface to add a new token to the wallet
export interface WatchAssetParameters {
  type: string; // The asset's interface, e.g. 'ERC20'
  options: {
    address: string; // The hexadecimal Ethereum address of the token contract
    symbol?: string; // A ticker symbol or shorthand, up to 5 alphanumerical characters
    decimals?: number; // The number of asset decimals
    image?: string; // A string url of the token logo
  };
}

export interface ProviderMessage {
  readonly type: string;
  readonly data: unknown;
}

export interface EthereumEvent {
  connect: ProviderConnectInfo;
  disconnect: ProviderRpcError;
  accountsChanged: string[];
  chainChanged: string;
  message: ProviderMessage;
  block: string;
}

type EventKeys = keyof EthereumEvent;
type EventHandler<K extends EventKeys> = (event: EthereumEvent[K]) => void;

export interface Ethereumish {
  chainId: string;
  isMetaMask?: boolean;
  isStatus?: boolean;
  networkVersion: string;
  selectedAddress: string;

  on<K extends EventKeys>(event: K, eventHandler: EventHandler<K>): void;
  enable(): Promise<string[]>;
  request(args: RequestArguments): Promise<unknown>;
  removeAllListeners: () => void;

  /**
   * @deprecated
   */
  send?: (...args: unknown[]) => unknown;
  sendAsync?: (
    request: { method: string; params?: Array<any> },
    callback: (error: any, response: any) => void
  ) => void;
}

export type Block = {
  difficulty: string;
  extraData: string;
  gasLimit: string;
  gasUsed: string;
  hash: string;
  logsBloom: string;
  miner: string;
  mixHash: string;
  nonce: string;
  number: string;
  parentHash: string;
  receiptsRoot: string;
  sha3Uncles: string;
  stateRoot: string;
  timestamp: string;
  transactionsRoot: string;
};

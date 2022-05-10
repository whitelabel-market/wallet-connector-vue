import type { EventEmitter } from "node:events";

// per EIP-1193
export interface RpcParams {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

// per EIP-1193
export interface Provider extends EventEmitter {
  request(args: RpcParams): Promise<unknown>;
  connect(): void;
  disconnect(): void;
}

// per EIP-1193
export interface ConnectInfo {
  readonly chainId: string;
}

// per EIP-1193
export interface RpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}

// per EIP-3085
// Interface for adding a new Ethereum chain to the wallet
export interface AddChainParams {
  chainId: number;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string; // 2-6 characters long
    decimals: 18;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[]; // Currently ignored.
}

// per EIP-747
// Interface to add a new token to the wallet
export interface WatchAssetParams {
  address: string; // Contract address of the token
  symbol: string; // The token symbol
  decimals: number; // The number of decimals
  image: string; // A string url to the logo of the token
}

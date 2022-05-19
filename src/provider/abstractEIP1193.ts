import { ProviderRpcError } from "../types";

export type BlockTag = string | number;

export abstract class EIP1193Provider {
  abstract getAddress(): Promise<string | ProviderRpcError>;
}

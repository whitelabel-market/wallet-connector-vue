import { MaybeRef } from "@vueuse/shared";
import {
  ProviderRpcError,
  Ethereumish,
  WatchAssetParameters,
  AddEthereumChainParameter,
  RpcMethods,
  SwitchEthereumChainParameter,
} from "../types";
import { isRef, unref } from "vue-demi";
import { EIP1193Provider } from "./abstractEIP1193";
import { EIP3085Provider } from "./abstractEIP3085";
import { EIP747Provider } from "./abstractEIP747";
import { EIP3326Provider } from "./abstractEIP3326";

export class WalletConnectorProvider
  implements EIP1193Provider, EIP3085Provider, EIP747Provider, EIP3326Provider
{
  public readonly provider;

  constructor(provider: MaybeRef<Ethereumish>) {
    this.provider = isRef(provider) ? unref(provider) : provider;
  }

  async getAddress(): Promise<string | ProviderRpcError> {
    const accounts: string[] = (await this.provider.request({
      method: RpcMethods.REQUEST_ACCOUNTS,
    })) as string[];

    if (accounts.length) return accounts[0];
    throw new Error(
      "Method `requestAccounts` returned empty list of accounts."
    );
  }

  async watchAsset(params: WatchAssetParameters): Promise<void> {
    await this.provider.request({
      method: RpcMethods.WATCH_ASSET,
      params,
    });
  }

  async addEthereumChain(
    params: AddEthereumChainParameter
  ): Promise<ProviderRpcError | null> {
    return (await this.provider.request({
      method: RpcMethods.ADD_CHAIN,
      params,
    })) as ProviderRpcError | null;
  }

  async switchEthereumChain(
    params: SwitchEthereumChainParameter
  ): Promise<ProviderRpcError | null> {
    return (await this.provider.request({
      method: RpcMethods.SWITCH_CHAIN,
      params,
    })) as ProviderRpcError | null;
  }
}

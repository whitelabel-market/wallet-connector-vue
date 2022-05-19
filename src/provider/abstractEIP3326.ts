import { SwitchEthereumChainParameter, ProviderRpcError } from "../types";

export abstract class EIP3326Provider {
  abstract switchEthereumChain(
    params: SwitchEthereumChainParameter
  ): Promise<null | ProviderRpcError>;
}

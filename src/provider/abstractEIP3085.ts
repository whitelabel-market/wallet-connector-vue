import { AddEthereumChainParameter, ProviderRpcError } from "../types";

export abstract class EIP3085Provider {
  abstract addEthereumChain(
    params: AddEthereumChainParameter
  ): Promise<null | ProviderRpcError>;
}

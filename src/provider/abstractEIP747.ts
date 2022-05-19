import { WatchAssetParameters } from "../types";

export type BlockTag = string | number;

export abstract class EIP747Provider {
  abstract watchAsset(params: WatchAssetParameters): Promise<void>;
}

import { useRecoilValueLoadable } from "recoil";

import { collectibleXnft } from "../../atoms";

export function useCollectibleXnftLoadable(params?: {
  collection?: string;
  mint?: string;
}) {
  return useRecoilValueLoadable(collectibleXnft(params ?? null));
}

import type { TokenInfo } from "@solana/spl-token-registry";
import { useRecoilValue } from "recoil";

import * as atoms from "../../atoms";

export function useSplTokenRegistry(): Map<string, TokenInfo> {
  return useRecoilValue(atoms.splTokenRegistry)!;
}

export function useSolanaTokenInfo(address: string): TokenInfo | undefined {
  const registry = useSplTokenRegistry();
  return registry.get(address);
}

import type { KeyringStoreState } from "@coral-xyz/secure-background/types";
import { useRecoilValue } from "recoil";

import * as atoms from "../atoms";

export function useKeyringStoreState(): KeyringStoreState {
  return useRecoilValue(atoms.userKeyringStoreStateAtom)!;
}

export function useKeyringHasMnemonic(): boolean {
  return useRecoilValue(atoms.keyringHasMnemonic);
}

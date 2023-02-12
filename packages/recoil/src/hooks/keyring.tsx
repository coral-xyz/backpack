import { useRecoilValue } from "recoil";

import * as atoms from "../atoms";
import type { KeyringStoreState } from "../atoms/keyring";

export function useKeyringStoreState(): KeyringStoreState {
  return useRecoilValue(atoms.keyringStoreState)!;
}

export function useKeyringHasMnemonic(): boolean {
  return useRecoilValue(atoms.keyringHasMnemonic);
}

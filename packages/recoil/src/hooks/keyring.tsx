import type { KeyringType } from "@coral-xyz/common";
import { useRecoilValue } from "recoil";

import * as atoms from "../atoms";
import type { KeyringStoreState } from "../atoms/keyring";

export function useKeyringStoreState(): KeyringStoreState {
  return useRecoilValue(atoms.keyringStoreState)!;
}

export function useKeyringType(): KeyringType {
  return useRecoilValue(atoms.keyringType)!;
}

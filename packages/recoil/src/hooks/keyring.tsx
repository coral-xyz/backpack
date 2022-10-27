import { useRecoilValue } from "recoil";
import { KeyringType } from "@coral-xyz/common";
import { KeyringStoreState } from "../atoms/keyring";
import * as atoms from "../atoms";

export function useKeyringStoreState(): KeyringStoreState {
  return useRecoilValue(atoms.keyringStoreState)!;
}

export function useKeyringType(): KeyringType {
  return useRecoilValue(atoms.keyringType)!;
}

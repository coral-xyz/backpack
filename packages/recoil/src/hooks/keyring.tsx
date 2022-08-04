import { useRecoilValue } from "recoil";
import { KeyringStoreState } from "../atoms/keyring";
import * as atoms from "../atoms";

export function useKeyringStoreState(): KeyringStoreState {
  return useRecoilValue(atoms.keyringStoreState)!;
}

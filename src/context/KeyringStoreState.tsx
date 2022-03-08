import { useRecoilState } from "recoil";
import { KeyringStoreState } from "../keyring/store";
import * as atoms from "../recoil/atoms";

export function useKeyringStoreState(): KeyringStoreState {
  return useRecoilState(atoms.keyringStoreState)[0]!;
}

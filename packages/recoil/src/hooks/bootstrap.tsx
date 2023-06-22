import { useRecoilValue } from "recoil";

import * as atoms from "../atoms";

import { useKeyringStoreState } from "./keyring";
import { useNavigation, useTab } from "./navigation";
import { useAllUsers } from "./preferences";
import { useSolanaCommitment } from "./solana";
import { useAllWalletsDisplayed } from "./wallet";

export function useBootstrapFast() {
  useRecoilValue(atoms.bootstrapFast);

  // Hack: load all the navigation atoms to prevent UI flickering.
  //       TODO: can batch these into a single request to the background script.
  useTab();
  useNavigation();
  useKeyringStoreState();
  useSolanaCommitment();
  useAllUsers();
  useAllWalletsDisplayed();
}

export function useRedirectUrl(): string {
  return useRecoilValue(atoms.navCurrentUrl);
}

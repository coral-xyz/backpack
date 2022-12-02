import { useRecoilValue } from "recoil";

import * as atoms from "../atoms";

import { useKeyringStoreState } from "./keyring";
import { useNavigation, useTab } from "./navigation";
import { useSolanaCommitment } from "./solana";
import { useAllUsers } from "./preferences";

export function useBootstrapFast() {
  useRecoilValue(atoms.bootstrapFast);

  // Hack: load all the navigation atoms to prevent UI flickering.
  //       TODO: can batch these into a single request to the background script.
  useTab();
  useNavigation();
  useKeyringStoreState();
  useSolanaCommitment();
  useAllUsers();
}

export function useRedirectUrl(): string {
  const nav = useRecoilValue(atoms.navData);
  const navData = nav.data[nav.activeTab];
  const url = navData.urls[navData.urls.length - 1];
  return url;
}

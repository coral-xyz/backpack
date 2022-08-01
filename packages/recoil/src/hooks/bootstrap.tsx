import { useRecoilValue } from "recoil";
import { useNavigation, useTab } from "./navigation";
import * as atoms from "../atoms";
import { useSolanaCommitment } from "./preferences";
import { useKeyringStoreState } from "./keyring";

// Bootstrap data for the initial load.
export function useBootstrap() {
  return useRecoilValue(atoms.bootstrap);
}

export function useBootstrapFast() {
  useRecoilValue(atoms.bootstrapFast);

  // Hack: load all the navigation atoms to prevent UI flickering.
  //       TODO: can batch these into a single request to the background script.
  useTab();
  useNavigation();
  useKeyringStoreState();
  useSolanaCommitment();
}

export function useRedirectUrl(): string {
  const nav = useRecoilValue(atoms.navData);
  const navData = nav.data[nav.activeTab];
  const url = navData.urls[navData.urls.length - 1];
  return url;
}

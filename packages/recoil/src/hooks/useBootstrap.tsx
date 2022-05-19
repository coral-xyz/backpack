import React, { useEffect } from "react";
import { usePlugins, useTablePlugins, useNavigationSegue } from "../hooks";

import { useRecoilValue } from "recoil";
import { useNavigation, useTab } from "./useNavigation";
import * as atoms from "../atoms";
import { useKeyringStoreState } from "./useKeyringStoreState";
import { useCommitment } from "./useRecentBlockhash";

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
  useCommitment();
}

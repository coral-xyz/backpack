import { useRecoilState, useRecoilValue } from "recoil";
import { UI_RPC_METHOD_APPROVED_ORIGINS_UPDATE } from "@coral-xyz/common";
import { KeyringStoreState } from "../atoms/keyring-store";
import * as atoms from "../atoms";
import { useBackgroundClient } from "./useBackgroundClient";

export function useKeyringStoreState(): KeyringStoreState {
  return useRecoilState(atoms.keyringStoreState)[0]!;
}

export function useApprovedOrigins(): Array<string> {
  return useRecoilValue(atoms.approvedOrigins)!;
}

export function useApproveOrigin(): (origin: string) => Promise<void> {
  const [approvedOrigins] = useRecoilState(atoms.approvedOrigins);
  const background = useBackgroundClient();
  return async (origin: string) => {
    const o = approvedOrigins!.find((o) => o === origin);
    if (o) {
      throw new Error("origin already approved");
    }
    await background.request({
      method: UI_RPC_METHOD_APPROVED_ORIGINS_UPDATE,
      params: [[...approvedOrigins!, origin]],
    });
  };
}

import { useRecoilState, useRecoilValue } from "recoil";
import {
  getBackgroundClient,
  UI_RPC_METHOD_APPROVED_ORIGINS_UPDATE,
} from "@coral-xyz/common";
import { KeyringStoreState } from "../atoms/keyring-store";
import * as atoms from "../atoms";

export function useKeyringStoreState(): KeyringStoreState {
  return useRecoilState(atoms.keyringStoreState)[0]!;
}

export function useApprovedOrigins(): Array<string> {
  return useRecoilValue(atoms.approvedOrigins)!;
}

export function useApproveOrigin(): (origin: string) => Promise<void> {
  const [approvedOrigins] = useRecoilState(atoms.approvedOrigins);
  return async (origin: string) => {
    const o = approvedOrigins!.find((o) => o === origin);
    if (o) {
      throw new Error("origin already approved");
    }
    const background = getBackgroundClient();
    await background.request({
      method: UI_RPC_METHOD_APPROVED_ORIGINS_UPDATE,
      params: [[...approvedOrigins!, origin]],
    });
  };
}

import { useRecoilState, useRecoilValue } from "recoil";
import { Commitment } from "@solana/web3.js";
import { UI_RPC_METHOD_APPROVED_ORIGINS_UPDATE } from "@coral-xyz/common";
import { KeyringStoreState } from "../atoms/keyring";
import * as atoms from "../atoms";
import { useBackgroundClient } from "./client";

export function useKeyringStoreState(): KeyringStoreState {
  return useRecoilValue(atoms.keyringStoreState)!;
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

export function useAutolockSecs(): number {
  return useRecoilValue(atoms.autoLockSecs)!;
}

export function useSolanaExplorer(): string {
  return useRecoilValue(atoms.solanaExplorer)!;
}

export function useSolanaCommitment(): Commitment {
  return useRecoilValue(atoms.solanaCommitment)!;
}

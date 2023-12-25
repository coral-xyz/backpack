import { UI_RPC_METHOD_APPROVED_ORIGINS_UPDATE } from "@coral-xyz/common";
import type { User } from "@coral-xyz/secure-background/types";
import { useRecoilValue } from "recoil";

import * as atoms from "../../atoms";
import { useBackgroundClient } from "../client";

export function useApprovedOrigins(): Array<string> {
  return useRecoilValue(atoms.approvedOrigins)!;
}

export function useApproveOrigin(): (origin: string) => Promise<void> {
  const approvedOrigins = useRecoilValue(atoms.approvedOrigins);
  const background = useBackgroundClient();
  return async (origin: string) => {
    const o = approvedOrigins!.find((o) => o === origin);
    if (o) {
      throw new Error("origin already approved");
    }
    // ph101pp todo
    await background.request({
      method: UI_RPC_METHOD_APPROVED_ORIGINS_UPDATE,
      params: [[...approvedOrigins!, origin]],
    });
  };
}

export function useAutoLockSettings() {
  return useRecoilValue(atoms.autoLockSettings);
}

export function useDarkMode(): boolean {
  return useRecoilValue(atoms.isDarkMode)!;
}

export function useDeveloperMode(): boolean {
  return useRecoilValue(atoms.isDeveloperMode)!;
}

export function useIsAggregateWallets(): boolean {
  return useRecoilValue(atoms.isAggregateWallets);
}

export function useConnectionUrls() {
  return useRecoilValue(atoms.allBlockchainConnectionUrls);
}

export function useUser(): User {
  return useRecoilValue(atoms.user);
}

export function useUserNullable(): User | null {
  return useRecoilValue(atoms.userNullable);
}

export function useAllUsers(): User[] {
  return useRecoilValue(atoms.allUsers);
}

export function useAllUsersNullable(): User[] | null {
  return useRecoilValue(atoms.allUsersNullable);
}

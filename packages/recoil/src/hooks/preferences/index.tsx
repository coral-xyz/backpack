import { useRecoilValue, useRecoilState } from "recoil";
import { UI_RPC_METHOD_APPROVED_ORIGINS_UPDATE } from "@coral-xyz/common";
import { useBackgroundClient } from "../client";
import * as atoms from "../../atoms";

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

export function useDarkMode(): boolean {
  return useRecoilValue(atoms.isDarkMode)!;
}

export function useDeveloperMode(): boolean {
  return useRecoilValue(atoms.isDeveloperMode)!;
}

export function useConnectionUrls() {
  return useRecoilValue(atoms.connectionUrls);
}

export function useUsername() {
  return useRecoilValue(atoms.username);
}

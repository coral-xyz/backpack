import type { User } from "@coral-xyz/secure-background/types";
import { useRecoilValue } from "recoil";

import * as atoms from "../../atoms";

export function useApprovedOrigins(): string[] {
  return useRecoilValue(atoms.approvedOrigins)!;
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

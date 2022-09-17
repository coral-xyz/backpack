import { useRecoilValue, useRecoilCallback } from "recoil";
import * as atoms from "../../atoms";

export function useTokenAddresses(): string[] {
  return useRecoilValue(atoms.solanaTokenAccountKeys);
}

export const useUpdateSplTokenAccounts = () =>
  useRecoilCallback(({ set }: any) => async ({ value }: { value: any }) => {
    set(atoms.solanaBalancePoll, value);
  });

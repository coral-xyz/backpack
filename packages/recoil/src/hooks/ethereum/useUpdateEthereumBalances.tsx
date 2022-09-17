import { useRecoilCallback } from "recoil";
import * as atoms from "../../atoms";

export const useUpdateEthereumBalances = () =>
  useRecoilCallback(({ set }: any) => async ({ value }: { value: any }) => {
    set(atoms.ethereumBalancePoll, value);
  });

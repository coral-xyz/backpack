import { useRecoilCallback } from "recoil";
import * as atoms from "../../atoms";

export const useUpdateEthereumBalances = () =>
  useRecoilCallback(({ set }: any) => ({ value }: { value: any }) => {
    set(atoms.ethereumBalancePoll, value);
  });

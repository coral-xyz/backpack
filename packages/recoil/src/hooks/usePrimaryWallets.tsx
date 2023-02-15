import { useRecoilValue } from "recoil";

import * as atoms from "../atoms";

export const usePrimaryWallets = () => {
  return useRecoilValue(atoms.primaryWallets);
};

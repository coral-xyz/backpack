import { useRecoilValue } from "recoil";

import * as atoms from "../atoms";

export function useRedirectUrl(): string {
  return useRecoilValue(atoms.navCurrentUrl);
}

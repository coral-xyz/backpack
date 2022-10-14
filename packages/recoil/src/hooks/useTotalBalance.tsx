import { useRecoilValue } from "recoil";
import * as atoms from "../";
import { getLogger } from "@coral-xyz/common";
const logger = getLogger("mobile-app");

export function useTotalBalance(): any {
  try {
    return useRecoilValue(atoms.totalBalance);
  } catch (err) {
    console.error("BROKEN: err", err);
    logger.debug("BROKEN: err", err);
    console.log("atoms.totalBalance", atoms.totalBalance);
    return {};
  }
}

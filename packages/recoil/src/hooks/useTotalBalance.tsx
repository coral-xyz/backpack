import { useRecoilValue } from "recoil";
import * as atoms from "../";
import { getLogger } from "@coral-xyz/common";
const logger = getLogger("mobile-app");

console.log("mobile-app:atoms", atoms);

export function useTotalBalance(): any {
  logger.debug("mobile-app", "useTotalBalance", "init");
  console.log("atoms.totalBalance", atoms.totalBalance);
  try {
    return useRecoilValue(atoms.totalBalance);
  } catch (err) {
    console.log("err", err);
    logger.debug("err", err);
    return {};
  }
}

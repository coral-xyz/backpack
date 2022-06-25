import { instructions, PsyFiIdl, pdas } from "psyfi-euros-test";
import { VaultsResponse } from "./types";

/**
 * Fetch all vaults owned by the psyfi program.
 */
export const fetchAllVaults: () => Promise<
  VaultsResponse | undefined
> = async () => {
  const mainnetUrl = "https://us-central1-psyfi-api.cloudfunctions.net/vaults";
  try {
    const resp = await fetch(mainnetUrl);
    const json = await resp.json();
    return json;
  } catch (err) {
    console.warn(err);
  }
};

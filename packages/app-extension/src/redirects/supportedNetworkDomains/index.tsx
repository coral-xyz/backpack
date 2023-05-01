import { ETH_TLD, SOL_TLD, supportedDomains } from "../constants";

import { handleDomainETH } from "./Ethereum";
import { handleDomainSOL } from "./Solana";

// Declare types
type DomainHandler = (
  nameServiceDomain: string,
  hostNameArray: string[],
  nameServicePathAndSearch: string,
  domainFull: string
) => Promise<void>;

type ResolveDomainNameType = {
  [K in typeof ETH_TLD | typeof SOL_TLD]: DomainHandler;
};

// Implementation

// Add-on domain name resolution methods here
/**
 * Domain resolution methods. Currently only supports ETH, SOL.
 * Able to add more domain resolution methods.
 */
export const ResolveDomainName: ResolveDomainNameType = {
  [ETH_TLD]: handleDomainETH,
  [SOL_TLD]: handleDomainSOL,
  // ... [MATIC_TLD] : handleDomainMATIC, etc...
};

// Verifies that the top level domain (e.g. sol, eth) is supported
export const isSupportedTLD = (
  tld: string
): tld is keyof typeof ResolveDomainName => {
  return supportedDomains.includes(tld);
};

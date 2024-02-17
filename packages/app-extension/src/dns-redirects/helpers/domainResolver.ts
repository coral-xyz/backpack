import { ETH_TLD, SOL_TLD, supportedDomains } from "../constants";
import { handleDomainETH, handleDomainSOL } from "../networks";

// Declare types
type DomainHandler = (
  nameServicePathAndSearch: string,
  fullDomainString: string
) => Promise<void>;

type ResolveDomainNameType = {
  [K in typeof ETH_TLD | typeof SOL_TLD]: DomainHandler;
};

// Implementation

// Add-on domain name resolution methods here
/**
 * Domain resolution methods.
 * Able to add more domain resolution methods.
 */
export const ResolveDomainName: ResolveDomainNameType = {
  [ETH_TLD]: handleDomainETH,
  [SOL_TLD]: handleDomainSOL,
  // ... [MONAD_TLD] : handleDomainMONAD,
};

// Verifies that the top level domain (e.g. sol, eth) is supported
export const isSupportedTLD = (
  tld: string
): tld is keyof typeof ResolveDomainName => {
  return supportedDomains.includes(tld);
};

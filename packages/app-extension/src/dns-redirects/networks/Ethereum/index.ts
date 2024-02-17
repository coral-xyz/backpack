import { EthereumConnectionUrl } from "@coral-xyz/secure-background/src/blockchain-configs/ethereum/connection-url";
import { ethers } from "ethers";

import { redirectToIpfs } from "../../helpers/";

const getContentFromAccount = async (
  nameServiceDomain: string
): Promise<string | undefined> => {
  const provider = new ethers.providers.JsonRpcProvider(
    EthereumConnectionUrl.MAINNET
  );
  const resolver = await provider.getResolver(nameServiceDomain);

  const data = await resolver?.getContentHash();
  if (!data) {
    return;
  }
  return data;
};

/**
 * Resolves Ethereum Domain
 * @param nameServiceDomain User's TLD
 * @param hostNameArray Array of domains which includes Domains and Subdomains
 * @param nameServicePathAndSearch Path of the url
 * @param domainFull Full concatenated domain
 */
export const handleDomainETH = async (
  nameServicePathAndSearch: string,
  domainFull: string
) => {
  const data = await getContentFromAccount(domainFull);
  if (!data) {
    throw new Error("invalid domain content");
  }
  await redirectToIpfs(data, nameServicePathAndSearch);
};

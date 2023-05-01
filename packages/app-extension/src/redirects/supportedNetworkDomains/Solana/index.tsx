import { getDomainKeySync } from "@bonfida/spl-name-service";
import * as web3 from "@solana/web3.js";

import { DEFAULT_SOLANA_CLUSTER } from "../../constants";
import redirectToIpfs from "../../ipfsBuilder";

/**
 * Retreive the data stored in a given account
 *
 * @param {web3.PublicKey} publicKey key pointing to the account
 * @returns {Promise<string>} Promise resolving to the stringified content of the account
 * @throws {Error}
 */
const getContentFromAccount = async (
  publicKey: web3.PublicKey,
  apiUrl = DEFAULT_SOLANA_CLUSTER
) => {
  const connection = new web3.Connection(apiUrl);
  const nameAccount = await connection.getAccountInfo(publicKey, "processed");
  const data = nameAccount?.data.toString("ascii").slice(96).replace(/\0/g, "");
  return data;
};

export const handleDomainSOL = async (
  nameServiceDomain: string,
  hostNameArray: string[],
  nameServicePathAndSearch: string,
  domainFull: string
) => {
  let accountKey = getDomainKeySync(domainFull);

  const data = await getContentFromAccount(accountKey.pubkey);

  if (!data) {
    throw new Error("Invalid domain content");
  }
  await redirectToIpfs(data, nameServicePathAndSearch);
};

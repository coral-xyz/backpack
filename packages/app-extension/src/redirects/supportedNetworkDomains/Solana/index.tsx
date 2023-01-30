import { getHashedName, getNameAccountKey } from "@bonfida/spl-name-service";
import * as web3 from "@solana/web3.js";

import { DEFAULT_SOLANA_CLUSTER } from "../../constants";
import redirectToIpfs from "../../ipfsBuilder";
/**
 * Compute the key for the account pointing to the domain.
 * See https://github.com/Bonfida/solana-name-service-guide
 *
 * @param {string} name The .sol domain name
 * @returns {Promise<web3.PublicKey>} Public key of the domain's account in the sns
 */
export const getDomainKey = async (name: string): Promise<web3.PublicKey> => {
  const SOL_TLD_AUTHORITY = new web3.PublicKey(
    "58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx"
  );
  const hashedName = await getHashedName(name);
  const domainKey = await getNameAccountKey(
    hashedName,
    undefined,
    SOL_TLD_AUTHORITY
  );
  return domainKey;
};

/**
 * Compute the key for the account pointing to a given subdomain.
 * See https://github.com/Bonfida/solana-name-service-guide
 *
 * @param {web3.PublicKey} parentDomainKey The parent .sol domain name
 * @param {string} subdomain The subdomain to compute the key for
 * @returns {Promise<web3.PublicKey>} Public key of the subdomain's account in the sns
 */
async function getSubdomainKey(
  parentDomainKey: web3.PublicKey,
  subdomain: string
) {
  const hashedName = await getHashedName("\0".concat(subdomain));
  const subdomainAccount = await getNameAccountKey(
    hashedName,
    undefined,
    parentDomainKey
  );
  return subdomainAccount;
}

/**
 * Retreive the data stored in a given account
 *
 * @param {web3.PublicKey} publicKey key pointing to the account
 * @returns {Promise<string>} Promise resolving to the stringified content of the account
 * @throws {Error}
 */
async function getContentFromAccount(
  publicKey: web3.PublicKey,
  apiUrl = DEFAULT_SOLANA_CLUSTER
) {
  const connection = new web3.Connection(apiUrl);
  const nameAccount = await connection.getAccountInfo(publicKey, "processed");
  const data = nameAccount?.data.toString("ascii").slice(96).replace(/\0/g, "");
  return data;
}

/**
 * Resolves Solana Domain
 * @param nameServiceDomain User's TLD
 * @param hostNameArray Array of domains which includes Domains and Subdomains
 * @param nameServicePathAndSearch Path of the url
 * @param domainFull Full concatenated domain
 */
export const handleDomainSOL = async (
  nameServiceDomain: string,
  hostNameArray: string[],
  nameServicePathAndSearch: string,
  domainFull?: string
) => {
  const domainKey = await getDomainKey(nameServiceDomain);

  let accountKey: web3.PublicKey = domainKey;
  // check for subdomains
  if (hostNameArray.length === 3) {
    accountKey = await getSubdomainKey(domainKey, hostNameArray[0]);
  } else if (hostNameArray.length > 3) {
    throw new Error("Multiple nested subdomains not supported");
  }

  const data = await getContentFromAccount(accountKey);

  if (!data) {
    throw new Error("Invalid domain content");
  }
  await redirectToIpfs(data, nameServicePathAndSearch);
};

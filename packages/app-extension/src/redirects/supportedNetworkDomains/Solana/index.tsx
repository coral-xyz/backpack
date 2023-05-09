import type { NameRegistryState } from "@bonfida/spl-name-service";
import {
  getArweaveRecord,
  getDomainKeySync,
  getIpfsRecord,
  getShdwRecord,
  getUrlRecord,
} from "@bonfida/spl-name-service";
import * as web3 from "@solana/web3.js";

import { DEFAULT_SOLANA_CLUSTER } from "../../constants";
import redirectToIpfs from "../../ipfsBuilder";

// Helper function to fetch record content and handle errors
const fetchRecordContent = async (
  recordPromise: (
    connection: web3.Connection,
    domain: string
  ) => Promise<NameRegistryState>,
  connection: web3.Connection,
  domainFull: string
): Promise<string | undefined> => {
  try {
    const record = await recordPromise(connection, domainFull);
    return record.data?.toString("ascii");
  } catch (error) {
    // If the record is not found, it errors and should return undefined
    return undefined;
  }
};

// Fetches domain content
const fetchDomainContent = async (
  connection: web3.Connection,
  domainFull: string
): Promise<string | undefined> => {
  const nameAccount = await connection.getAccountInfo(
    getDomainKeySync(domainFull).pubkey,
    "processed"
  );

  return nameAccount?.data.toString("ascii").slice(96).replace(/\0/g, "");
};

// Main function to fetch content from different records in priority order
const getContentFromAccount = async (
  domainFull: string,
  apiUrl: string = DEFAULT_SOLANA_CLUSTER
): Promise<string | undefined> => {
  const connection = new web3.Connection(apiUrl);

  // Create an array of promises for fetching content from different records with chronological priority
  // Prioritizes url, ipfs, shdw, ar records in this order, and checks domain content as well if none of them resolves
  const fetchPromises = [
    fetchRecordContent(getUrlRecord, connection, domainFull),
    fetchRecordContent(getIpfsRecord, connection, domainFull),
    fetchRecordContent(getShdwRecord, connection, domainFull),
    fetchRecordContent(getArweaveRecord, connection, domainFull),
    fetchDomainContent(connection, domainFull),
  ];

  // Use Promise.allSettled to wait for all promises to be settled (fulfilled or rejected)
  const settledResults = await Promise.allSettled(fetchPromises);

  // Find the first fulfilled promise with a valid result (i.e., the first successful record fetched)
  const firstFulfilled = settledResults.find(
    (result) => result.status === "fulfilled" && result.value !== undefined
  ) as PromiseFulfilledResult<string | undefined>;

  return firstFulfilled.value;
};

// Function to handle the domain, fetch content, and redirect to IPFS
export const handleDomainSOL = async (
  nameServiceDomain: string,
  hostNameArray: string[],
  nameServicePathAndSearch: string,
  domainFull: string
) => {
  // Fetch content from the domain
  const data = await getContentFromAccount(domainFull);

  // If no data is found, throw an error
  if (!data) {
    throw new Error("Invalid domain content");
  }

  // Redirect to IPFS using the fetched data
  await redirectToIpfs(data, nameServicePathAndSearch);
};

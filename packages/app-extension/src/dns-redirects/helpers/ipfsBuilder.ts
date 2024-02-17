// Modified implementation from https://github.com/zhvng/sns-resolver. Thank @zhvng!

import {
  allPrefixes,
  arweavePrefix,
  DEFAULT_GATEWAY,
  ipAddressRegex,
  PREFIX,
  shadowDrivePrefix,
} from "../constants";

import { addHttps } from "./tabHelper";

// ----------------------------------------------------------------
// Handles IPFS Gateway Fetching and Resolution Toggle
interface GatewayData {
  IPFSGateway?: string;
}
/**
 * Retreive user preferred IPFS gateway from local storage
 *
 * @returns {Promise<string>} Stored IPFS gateway url
 */

export async function getIPFSGateway() {
  const data: GatewayData = await new Promise((resolve, reject) => {
    chrome.storage.local.get("IPFSGateway", (data) =>
      data ? resolve(data) : reject()
    );
  });

  if ("IPFSGateway" in data) {
    return data["IPFSGateway"];
  } else {
    await setIPFSGateway(DEFAULT_GATEWAY);
    return DEFAULT_GATEWAY;
  }
}

/**
 * Set user's preferred IPFS gateway to a new gateway url.
 * Retrieve url from the `IPFSGateways` object or use a custom url if needed
 * @param {string} gateway New IPFS Gateway url
 */
export async function setIPFSGateway(gateway: string) {
  await new Promise<void>((resolve) => {
    chrome.storage.local.set({ IPFSGateway: gateway }, () => resolve());
  });
}

export const toggleSupportedNetworkResolution = async (
  network: string,
  enabled: boolean
) => {
  await new Promise<void>((resolve) => {
    chrome.storage.local.set({ [`${network}-domain`]: enabled }, () =>
      resolve()
    );
  });
};

export interface SupportedWebDNSNetworkResolutionData {
  [key: string]: boolean;
}
export const getSupportedNetworkResolution = async (
  network: string
): Promise<boolean> => {
  const data = await new Promise<SupportedWebDNSNetworkResolutionData>(
    (resolve, reject) => {
      chrome.storage.local.get(`${network}-domain`, (data) =>
        data ? resolve(data) : reject()
      );
    }
  );

  if (`${network}-domain` in data) {
    return data[`${network}-domain`];
  } else {
    await toggleSupportedNetworkResolution(network, false);
    return false;
  }
};

// ----------------------------------------------------------------
// Url Builder Helpers

/**
 * Build IPFS url from cid and path
 *
 * @param {string} cid IPFS cid to access with url
 * @param {string} path path of the url (containing any search params)
 * @param {PREFIX} prefix prefix of the url
 */
export const buildIpfsOrIpnsUrl = async (
  cid: string,
  path: string,
  prefix: PREFIX
) => {
  const gatewayUrl = await getIPFSGateway();
  return addHttps(gatewayUrl + prefix + cid + path);
};

/**
 * Checks if URL prefix starts with IPFS or IPNS
 * @param data Domain content
 * @param prefixes Defaults to specified IPFS and IPNS
 * @returns Returns the prefix it starts with else null
 */
export const checkUrlPrefix = (
  data: string,
  prefixes: string[] = allPrefixes
) => {
  for (let prefix of prefixes) {
    if (data.startsWith(prefix)) {
      return prefix;
    }
  }
  return null;
};

/**
 * Constructs a url depending on the type of url and prefix
 * @param data Domain content
 * @param nameServicePathAndSearch Path of the url
 */
export const redirectToIpfs = async (
  data: string,
  nameServicePathAndSearch: string
) => {
  const urlPrefix = checkUrlPrefix(data);
  let url = "";
  if (urlPrefix) {
    const content = data.slice(urlPrefix.length);
    url = await getUrlByPrefix(urlPrefix, content, nameServicePathAndSearch);
  } else if (data.match(ipAddressRegex)) {
    url = "http://" + data + nameServicePathAndSearch;
  } else {
    url = addHttps(data + nameServicePathAndSearch);
  }
  let response = await fetch(url);
  if (response.status != 200) {
    throw new Error("invalid url");
  }
  window.location.href = url;
};

/**
 * Helper function to get the URL based on the prefix
 * @param prefix The prefix of the URL
 * @param content The content identifier or hash
 * @param pathAndSearch The path and search query of the URL
 * @returns The formatted URL
 */
export const getUrlByPrefix = async (
  prefix: string,
  content: string,
  pathAndSearch: string
): Promise<string> => {
  if (prefix.includes("ipfs") || prefix.includes("ipns")) {
    return await buildIpfsOrIpnsUrl(
      content,
      pathAndSearch,
      prefix.includes("ipfs") ? PREFIX.IPFS : PREFIX.IPNS
    );
  } else if (prefix === arweavePrefix) {
    return `https://arweave.net/${content}${pathAndSearch}`;
  } else if (prefix === shadowDrivePrefix) {
    return `https://shdw-drive.genesysgo.net/${content}${pathAndSearch}`;
  }
  return "";
};

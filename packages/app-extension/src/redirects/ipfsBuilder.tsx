// Modified implementation from https://github.com/zhvng/sns-resolver. Thank @zhvng!

import {
  DEFAULT_GATEWAY,
  ipAddressRegex,
  ipnsOrIpfsPrefix,
  PREFIX,
} from "./constants";
import { addHttps } from "./ResolveDomainName";

/**
 * Build IPFS url from cid and path
 *
 * @param {string} cid IPFS cid to access with url
 * @param {string} path path of the url (containing any search params)
 * @param {PREFIX} prefix prefix of the url
 */
export async function build_IPFS_OR_IPNS_Url(
  cid: string,
  path: string,
  prefix: PREFIX
) {
  const gatewayUrl = await getIPFSGateway();
  return addHttps(gatewayUrl + prefix + cid + path);
}

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
 * Retreive url from the `IPFSGateways` object or use a custom url if needed
 *
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
/**
 * Checks if URL prefix starts with IPFS or IPNS
 * @param data Domain content
 * @param prefixes Defaults to specified IPFS and IPNS
 * @returns Returns the prefix it starts with else null
 */
export const checkUrlPrefix = (
  data: string,
  prefixes: string[] = ipnsOrIpfsPrefix
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
const redirectToIpfs = async (
  data: string,
  nameServicePathAndSearch: string
) => {
  const urlPrefix = checkUrlPrefix(data);
  let url: string;
  if (urlPrefix) {
    const cid = data.slice(urlPrefix.length);
    url = await build_IPFS_OR_IPNS_Url(
      cid,
      nameServicePathAndSearch,
      urlPrefix.includes("ipfs") ? PREFIX.IPFS : PREFIX.IPNS
    );
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

export default redirectToIpfs;

import { TldToNetworkMapping } from "../constants";
import { extractDomainParts } from "..";

import { getSupportedNetworkResolution } from "./ipfsBuilder";

/**
 * Check if the network resolution is enabled for the given domain.
 * @param urlString - Parsed url string which consists of the TLD and its subdomains.
 */
const checkIfNetworkResolutionEnabled = async (
  urlString: string
): Promise<boolean> => {
  const { currentTLD } = extractDomainParts(new URL(addHttps(urlString)));
  // Check if the domain resolution is enabled
  if (currentTLD in TldToNetworkMapping) {
    const blockchain =
      TldToNetworkMapping[currentTLD as keyof typeof TldToNetworkMapping];
    return getSupportedNetworkResolution(blockchain);
  }

  return false;
};

export const redirect = async (urlString: string) => {
  if (await checkIfNetworkResolutionEnabled(urlString)) {
    const tab: chrome.tabs.Tab = await getCurrentTab();

    if (tab !== undefined && urlString !== undefined) {
      await chrome.tabs.update(tab.id || chrome.tabs.TAB_ID_NONE, {
        url: `./dns-redirect.html?domain=${urlString}`,
      });
    }
  }
};

export const getCurrentTab = (): Promise<chrome.tabs.Tab> => {
  return new Promise((resolve, reject) => {
    try {
      chrome.tabs.query(
        { active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
        function (tabs) {
          resolve(tabs[0]);
        }
      );
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * Append the `https://` scheme to the beginning of a url if it does not have it.
 *
 * @param {string} url to add the scheme to
 * @returns {string} url with a scheme
 */
export const addHttps = (url: string): string => {
  if (!url.match(/^(?:f|ht)tps?:\/\//)) {
    url = "https://" + url;
  }
  return url;
};

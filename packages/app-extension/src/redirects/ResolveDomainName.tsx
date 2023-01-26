export const redirect = async (urlString: string) => {
  const tab: chrome.tabs.Tab = await getCurrentTab();

  if (tab !== undefined && urlString !== undefined) {
    chrome.tabs.update(tab.id || chrome.tabs.TAB_ID_NONE, {
      url: `./redirect.html?domainUrl=${urlString}`,
    });
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

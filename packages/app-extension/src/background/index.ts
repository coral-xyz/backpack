import { start } from "@coral-xyz/background";

import { supportedDomains, urlPatterns } from "../dns-redirects/constants";
import { redirect } from "../dns-redirects/helpers/tabHelper";

start({
  isMobile: false,
});

/**
 * Resolves domain names in the form of URLs.
 */
chrome.webNavigation.onBeforeNavigate.addListener(
  async (details) => {
    await redirect(details.url);
  },
  {
    url: supportedDomains.map((domain) => {
      return { urlMatches: `^[^:]+://[^/]+.${domain}/.*$` };
    }),
  }
);

/**
 * Resolves domain names in the form of browser searches via Google, Bing, etc.
 * DuckDuckGo has a unique search pattern and must be queried separately.
 */
chrome.webNavigation.onBeforeNavigate.addListener(
  async (details) => {
    const domainUrl = new URL(details.url).searchParams.get("q");
    if (domainUrl && domainUrl.indexOf(" ") < 0) await redirect(domainUrl);
  },
  {
    url: supportedDomains.flatMap((param) =>
      urlPatterns.map((pattern) => {
        return {
          urlMatches: pattern.includes("duckduckgo")
            ? `${pattern}\\.${param}$`
            : `${pattern}\\.${param}&.*$`,
        };
      })
    ),
  }
);

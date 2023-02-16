import { start } from "@coral-xyz/background";

import { supportedDomains, urlPatterns } from "../redirects/constants";
import { redirect } from "../redirects/ResolveDomainName";

start({
  isMobile: false,
});

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

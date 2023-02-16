import { ETH_TLD, SOL_TLD } from "./constants";
import { addHttps } from "./ResolveDomainName";
import * as dnsResolver from "./supportedNetworkDomains";

async function main() {
  // Extract the domainUrl search parameter
  const domain = new URL(window.location.href).searchParams.get("domain");
  if (!domain) {
    return;
  }

  // Add HTTPS to the domainUrl value
  const domainUrl = addHttps(domain);
  const urlParsed = new URL(domainUrl);

  // Split the hostname into an array of parts
  const hostNameArray = urlParsed.hostname.split(".");

  let domainFull = "";

  // Iterate through the array, concatenating each item until we reach the last two
  for (let i = 0; i < hostNameArray.length - 2; i++) {
    domainFull += hostNameArray[i] + ".";
  }

  // Extract the name service domain and TLD
  const nameServiceDomain = hostNameArray[hostNameArray.length - 2];
  const currentTLD = hostNameArray[hostNameArray.length - 1];

  // Concatenate the name service domain and TLD to form the full domain
  domainFull += nameServiceDomain + "." + currentTLD;

  //----------------------------------------------------------------

  // Concatenate the name service path and search values
  const nameServicePathAndSearch = urlParsed.pathname + urlParsed.search;

  // Update the domain display text
  const displayText = document.getElementById("domainDisplay");
  if (displayText) displayText.textContent = domainFull;

  try {
    // Handle the domain based on the TLD
    switch (currentTLD) {
      case SOL_TLD:
        await dnsResolver.handleDomainSOL(
          nameServiceDomain,
          hostNameArray,
          nameServicePathAndSearch,
          domainFull
        );
        break;
      case ETH_TLD:
        await dnsResolver.handleDomainETH(
          nameServiceDomain,
          hostNameArray,
          nameServicePathAndSearch,
          domainFull
        );
        break;
      default:
        throw new Error("invalid TLD");
    }
  } catch (err) {
    console.log(err);
    // Redirect to error page if something fails;;
    window.location.href = "./redirect404.html";
  }
}

main();

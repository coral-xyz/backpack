import { addHttps } from "./ResolveDomainName";
import { isSupportedTLD, ResolveDomainName } from "./supportedNetworkDomains";

// Define the return type for the extractDomainParts function
interface DomainParts {
  hostNameArray: string[];
  nameServiceDomain: string;
  currentTLD: string;
}

/**
 * A function to extract domain parts from a URL object.
 * @param url - A URL object to extract domain parts from.
 * @returns An object containing an array of hostNameArray, nameServiceDomain, and currentTLD.
 *
 * For example, given a URL like `blog.mjlee.sol`:
 * - hostNameArray is an array ["blog", "mjlee", "sol"]
 * - nameServiceDomain is the user's level domain, in this case, "mjlee"
 * - currentTLD is the most Top level domain, in this case, "sol"
 */
export const extractDomainParts = (url: URL): DomainParts => {
  const hostNameArray = url.hostname.split(".");
  const nameServiceDomain = hostNameArray[hostNameArray.length - 2];
  const currentTLD = hostNameArray[hostNameArray.length - 1];
  return { hostNameArray, nameServiceDomain, currentTLD };
};

/**
 * Main function that handles domain resolution and redirecting.
 * This function extracts the domain from the URL, checks if the domain TLD is supported,
 * updates the domain display text, and calls the relevant ResolveDomainName function.
 * If an error occurs during domain resolution, it redirects the user to the error page.
 */
const main: () => Promise<void> = async () => {
  if (typeof window === "undefined") {
    return;
  }
  // Extract the domainUrl search parameter
  const domain = new URL(window.location.href).searchParams.get("domain");
  if (!domain) {
    return;
  }

  // Reformat URL if required, for parsing and extracting information we need.
  const urlParsed = new URL(addHttps(domain));
  const { hostNameArray, nameServiceDomain, currentTLD } =
    extractDomainParts(urlParsed);

  // Exit early if the domain is not supported
  if (!isSupportedTLD(currentTLD)) {
    return;
  }

  // Concatenate the domain parts to form the full domain
  const leadingDomain = hostNameArray.slice(0, -2).join(".");
  const domainFull =
    (leadingDomain ? leadingDomain + "." : "") +
    nameServiceDomain +
    "." +
    currentTLD;

  // Concatenate the name service path and search values
  const nameServicePathAndSearch = urlParsed.pathname + urlParsed.search;

  // Update the domain display text
  const displayText = document.getElementById("domainDisplay");
  if (displayText) displayText.textContent = domainFull;

  try {
    // Call the relevant ResolveDomainName function for the current TLD
    await ResolveDomainName[currentTLD](
      nameServiceDomain,
      hostNameArray,
      nameServicePathAndSearch,
      domainFull
    );
  } catch (err) {
    console.log(err);
    window.location.href = "./redirect404.html";
  }
};

void main();

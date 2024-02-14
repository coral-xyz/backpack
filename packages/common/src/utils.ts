import type { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { ethers } from "ethers";
import { v1 } from "uuid";

export function toTitleCase(str: string) {
  return str?.slice(0, 1)?.toUpperCase() + str?.toLowerCase()?.slice(1);
}

/**
 * A globally unique ID generator, useful for stateless or readonly things
 * @returns
 * uuid/v1, in case we need to extract the timestamp when debugging
 */
export function generateUniqueId() {
  return v1();
}

export function isServiceWorker(): boolean {
  return globalThis.clients !== undefined;
}

/**
 * Make any necessary changes to URIs before the client queries them.
 *
 * TODO: replace host with host of caching layer for thumbnail generation, caching,
 * SVG sanitization, etc.
 */
export function externalResourceUri(
  uri: string,
  options: { cached?: boolean } = {}
): string {
  if (uri) {
    uri = uri.replace(/\0/g, "");
  }
  if (uri && uri.startsWith("ipfs://")) {
    return uri.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/");
    // return uri.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  if (uri && uri.startsWith("ar://")) {
    return uri.replace("ar://", "https://arweave.net/");
  }
  if (options.cached) {
    return `https://swr.xnftdata.com/1min/${uri}`;
  }
  return `${uri}`;
}

export function proxyImageUrl(
  url: string,
  size = 400,
  unbounded?: boolean
): string {
  if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
    if (url.includes("swr.xnftdata.com/avatars/")) {
      url += `?size=${size}`;
    }
    return `https://imageresizer.xnftdata.com/fit=contain,${
      unbounded ? `width=${size},` : `width=${size},height=${size},`
    }quality=85/${url}`;
  }
  return url;
}

export function toDisplayBalance(
  nativeBalance: BigNumberish,
  decimals: BigNumberish,
  truncate = true,
  skipFormat = false
): string {
  let displayBalance: string;
  if (skipFormat && typeof nativeBalance === "string") {
    displayBalance = nativeBalance;
  } else {
    displayBalance = ethers.utils.formatUnits(nativeBalance, decimals);
  }

  if (truncate) {
    try {
      displayBalance = `${displayBalance.split(".")[0]}.${displayBalance
        .split(".")[1]
        .slice(0, 5)}`;
    } catch {
      // pass
    }
  }

  return ethers.utils.commify(displayBalance);
}

export function reverseScientificNotation(n: number): string {
  const str = n.toString();
  if (!str.includes("e")) {
    return str;
  }

  const [base, exp] = str.split("e");
  const decimals = parseInt(exp);

  if (decimals < 0) {
    const sign = base[0] === "-" ? "-" : "";
    return `${sign}0.${Array(Math.abs(decimals) - 1)
      .fill("0")
      .join("")}${base.replace(/[-.]/g, "")}`;
  }

  const baseSplit = base.split(".");
  const baseDecimals = baseSplit.length === 1 ? 0 : baseSplit[1].length;
  return `${base.replace(".", "")}${Array(decimals - baseDecimals)
    .fill("0")
    .join("")}`;
}

/**
 * Utility function that converts a string decimal like "0.001" into
 * a BigNumber based on the token's number of decimals.
 * Should probably be changed into a hook.
 */
export function decimalNumberStringIntoBigNumber({
  strAmount,
  tokenDecimals,
  setStrAmount,
  setAmount,
}: {
  strAmount: string;
  /** from [_, setStrAmount] = useState("") */
  setStrAmount: (amount: string) => void;
  /** number of decimals for the token, e.g. Solana would be 9 */
  tokenDecimals: number;
  /** from [_, setAmount] = useState(BigNumber.from(0)) */
  setAmount: (bigNumber: BigNumber | null) => void;
}) {
  try {
    let parsedVal = strAmount
      .trim()
      // remove all characters except for 0-9 and .
      .replace(/[^\d.]/g, "")
      // prepend a 0 if . is the first character
      .replace(/^\.(\d+)?$/, "0.$1")
      // remove any periods after the first one
      .replace(/^(\d+\.\d*?)\./, "$1")
      // trim to the number of decimals allowed for the token
      .replace(new RegExp(`^(\\d+\\.\\d{${tokenDecimals}}).+`), "$1")
      // remove any leading 0s
      .replace(/^0([1-9]+)/, "$1")
      // only allow one 0 before a .
      .replace(/^0+$/, "0");

    if (parsedVal === "") {
      setStrAmount("0");
      setAmount(null);
      return;
    }

    const numericVal = Number(parsedVal);

    if (!Number.isFinite(numericVal)) {
      return;
    }

    setStrAmount(parsedVal); // TODO: use numericVal.toLocaleString(), but this has issues with trailing .

    if (parsedVal.endsWith(".")) {
      // can't `throw new Error("trailing")` due to Error function
      throw "trailing .";
    }

    const finalAmount = ethers.utils.parseUnits(parsedVal, tokenDecimals);

    setAmount(finalAmount.isZero() ? null : finalAmount);
  } catch (err) {
    setAmount(null);
  }
}

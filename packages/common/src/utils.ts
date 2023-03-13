import type { BigNumberish } from "@ethersproject/bignumber";
import { Keypair } from "@solana/web3.js";
import * as bs58 from "bs58";
import type { BigNumber } from "ethers";
import { ethers } from "ethers";
import { v1 } from "uuid";

import { Blockchain } from "./types";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function toTitleCase(str: string) {
  return str?.slice(0, 1)?.toUpperCase() + str?.toLowerCase()?.slice(1);
}

/**
 * Formats a number or number string into a pretty USD string
 * @example
 * formatUSD(-1234567.89) // "-$1,234,567.89"
 */
export function formatUSD(amount: number | string) {
  let amountNumber: number;
  if (typeof amount === "string") {
    amountNumber = Number(amount.replace(",", ""));
  } else {
    amountNumber = amount;
  }
  return usd.format(amountNumber);
}

/**
 * A globally unique ID generator, useful for stateless or readonly things
 * @returns
 * uuid/v1, in case we need to extract the timestamp when debugging
 */
export function generateUniqueId() {
  return v1();
}

export function isMobile(): boolean {
  if (typeof window !== "undefined" && typeof window.document !== "undefined") {
    return false;
  }

  return true;
}

/**
 * True if we're in the mobile environment.
 */
export const IS_MOBILE = globalThis.chrome
  ? // `global.chrome` exists, we're in chromium.
    false
  : globalThis.browser
  ? // `global.browser` exists, we're in FF/safari.
    false
  : true;

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
    return `https://swr.xnfts.dev/1hr/${uri}`;
  }
  return `${uri}`;
}

export function proxyImageUrl(url: string): string {
  if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
    return `https://images.xnfts.dev/cdn-cgi/image/fit=contain,width=400,height=400,quality=85/${url}`;
  }
  return url;
}

export function toDisplayBalance(
  nativeBalance: BigNumber,
  decimals: BigNumberish,
  truncate = true
): string {
  let displayBalance = ethers.utils.formatUnits(nativeBalance, decimals);

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
 * Validate a private key
 */
export function validatePrivateKey(
  privateKey: string,
  blockchain?: Blockchain
): {
  privateKey: string;
  publicKey: string;
  blockchain: Blockchain;
} {
  if (blockchain === Blockchain.SOLANA) {
    return validateSolanaPrivateKey(privateKey);
  } else if (blockchain === Blockchain.ETHEREUM) {
    return validateEthereumPrivateKey(privateKey);
  } else {
    // If blockchain not explicitly passed, allow for any possible
    try {
      return validateSolanaPrivateKey(privateKey);
    } catch {
      try {
        return validateEthereumPrivateKey(privateKey);
      } catch {
        // Don't throw the error from the Ethereum function because if we are
        // down here no blockchain was specified in the args.
        throw new Error("Invalid private key");
      }
    }
  }
}

/**
 * Validate an Ethereum private key
 */
export function validateEthereumPrivateKey(privateKey: string): {
  privateKey: string;
  publicKey: string;
  blockchain: Blockchain;
} {
  let wallet: ethers.Wallet;
  try {
    wallet = new ethers.Wallet(privateKey);
  } catch (_) {
    throw new Error("Invalid Ethereum private key");
  }
  return {
    privateKey: wallet.privateKey,
    publicKey: wallet.address,
    blockchain: Blockchain.ETHEREUM,
  };
}

/**
 * Validate a Solana private key
 */
export function validateSolanaPrivateKey(privateKey: string): {
  privateKey: string;
  publicKey: string;
  blockchain: Blockchain;
} {
  let keypair: Keypair | null = null;
  try {
    // Attempt to create a keypair from JSON secret key
    keypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(privateKey)));
  } catch (_) {
    // Try the next method
    try {
      // Attempt to create a keypair from bs58 decode of secret key
      keypair = Keypair.fromSecretKey(new Uint8Array(bs58.decode(privateKey)));
    } catch (_) {
      // Failure, no other ways to interpret
      throw new Error("Invalid Solana private key");
    }
  }

  return {
    privateKey: Buffer.from(keypair.secretKey).toString("hex"),
    publicKey: keypair.publicKey.toString(),
    blockchain: Blockchain.SOLANA,
  };
}

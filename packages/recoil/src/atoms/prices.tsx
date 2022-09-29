import { atomFamily, selector, selectorFamily } from "recoil";
import { ethers } from "ethers";
import { ETH_NATIVE_MINT } from "@coral-xyz/common";
import { TokenDisplay } from "../types";
import { customSplTokenAccounts } from "./solana/token";
import { splTokenRegistry } from "./solana/token-registry";
import { erc20Balances } from "./ethereum/token";
import { equalSelector } from "../equals";
import { solanaConnectionUrl } from "./solana/preferences";
import { solanaPublicKey } from "./wallet";

const baseCoingeckoParams = {
  vs_currencies: "usd",
  include_market_cap: "true",
  include_24hr_vol: "true",
  include_24hr_change: "true",
  include_last_updated_at: "true",
};

export const priceData = atomFamily<TokenDisplay | null, string>({
  key: "priceData",
  default: selectorFamily({
    key: "priceDataDefault",
    get:
      (address: string) =>
      ({ get }: any) => {
        const allPrices = new Map([
          ...get(pricesForIds),
          ...get(pricesForErc20Addresses),
        ]);
        return allPrices.get(address) as TokenDisplay;
      },
  }),
});
//
// Map of SPL mint addresses to Coingecko ID
export const splMintsToCoingeckoId = equalSelector({
  key: "splMintsToCoingeckoId",
  get: ({ get }: any) => {
    const connectionUrl = get(solanaConnectionUrl);
    const publicKey = get(solanaPublicKey);
    const { splTokenAccounts } = get(
      customSplTokenAccounts({ connectionUrl, publicKey })
    );
    const tokenRegistry = get(splTokenRegistry);
    return [...splTokenAccounts.values()].reduce((acc, splTokenAccount) => {
      const mint = splTokenAccount.mint.toString();
      const tokenInfo = tokenRegistry.get(mint);
      if (
        tokenInfo &&
        tokenInfo.extensions &&
        tokenInfo.extensions.coingeckoId
      ) {
        acc.set(mint, tokenInfo.extensions.coingeckoId);
      }
      return acc;
    }, new Map());
  },
  // Map equality
  equals: (m1, m2) =>
    m1.size === m2.size &&
    Array.from(m1.keys()).every((key) => m1.get(key) === m2.get(key)),
});

// Map of Ethereum addresses to Coingecko ID
export const ethAddressToCoingeckoId = selector<Map<string, string>>({
  key: "ethereumAddressToCoingeckoId",
  get: () => {
    const addressIdMap = new Map();
    addressIdMap.set(ETH_NATIVE_MINT, "ethereum");
    return addressIdMap;
  },
});

// Map of addresses to Coingecko ID (any blockchain)
export const addressToCoingeckoId = selector({
  key: "addressToCoingeckoId",
  get: ({ get }: any) => {
    return new Map([
      ...get(splMintsToCoingeckoId),
      ...get(ethAddressToCoingeckoId),
    ]);
  },
});

// Map of Coingecko IDs to addresses (any blockchain)
export const coingeckoIdToAddress = selector({
  key: "coingeckoIdToAddress",
  get: ({ get }: any) => {
    return new Map(
      [...get(addressToCoingeckoId).entries()].map(([a, b]) => [b, a])
    );
  },
});

// The list of all Coingecko token IDs prices need to be loaded for.
// This is determined by the list of all tokens in the wallet.
export const coingeckoIds = selector({
  key: "coingeckoIds",
  get: ({ get }: any) => {
    const allIds = [
      ...get(splMintsToCoingeckoId).values(),
      ...get(ethAddressToCoingeckoId).values(),
    ].flat();
    // Deduplicate
    return [...new Set(allIds)];
  },
});

// The list of all Ethereum ERC20 contract addresses prices need to be loaded
// for.
export const erc20ContractAddresses = equalSelector({
  key: "erc20ContractAddresses",
  get: ({ get }: any) => {
    const balances = get(erc20Balances);
    const addresses = [...balances.keys()].filter(
      // TODO figure out how ETH_NATIVE_MINT ends up in this array
      (k: string) => k !== ETH_NATIVE_MINT
    );
    addresses.sort();
    return addresses;
  },
  equals: (a1, a2) => JSON.stringify(a1) === JSON.stringify(a2),
});

// Coingecko API query for all Coingecko IDs
const pricesForIds = selector({
  key: "pricesFoIds",
  get: async ({ get }: any) => {
    const ids = get(coingeckoIds);
    if (ids.length === 0) return {};
    const params = {
      ...baseCoingeckoParams,
      ids,
    };
    const queryString = new URLSearchParams(params).toString();
    const resp = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?${queryString}`
    );
    const json = await resp.json();
    const coingeckoIdToAddressMap = get(coingeckoIdToAddress);
    return new Map(
      // Transform the response from id -> price data to addresss -> price data
      Object.keys(json).map((id) => [coingeckoIdToAddressMap.get(id), json[id]])
    );
  },
});

// Coingecko API query for all ERC20 contract addresses
const pricesForErc20Addresses = selector({
  key: "pricesForErc20Addresses",
  get: async ({ get }: any) => {
    const contractAddresses = get(erc20ContractAddresses);
    if (contractAddresses.length === 0) {
      // No contract addresses, nothing to query
      return new Map();
    }
    const params = {
      ...baseCoingeckoParams,
      contract_addresses: contractAddresses,
    };
    const queryString = new URLSearchParams(params).toString();
    const resp = await fetch(
      `https://api.coingecko.com/api/v3/simple/token_price/ethereum?${queryString}`
    );
    const json = await resp.json();
    return new Map(
      // Transform the response from id -> price data to addresss -> price data
      Object.keys(json).map((address) => [
        ethers.utils.getAddress(address),
        json[address],
      ])
    );
  },
});

// Retrieve only the Etheruem price. Useful for transaction approval screens
// where the exchange rate is needed to show transaction fee.
export const ethereumPrice = selector({
  key: "ethereumPrice",
  get: async () => {
    const params = {
      ...baseCoingeckoParams,
      ids: "ethereum",
    };
    const queryString = new URLSearchParams(params).toString();
    const resp = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?${queryString}`
    );
    const json = await resp.json();
    return json["ethereum"];
  },
});

import { Blockchain } from "@coral-xyz/common";
import { ETH_NATIVE_MINT } from "@coral-xyz/secure-clients/legacyCommon";
import { ethers } from "ethers";
import { selector, selectorFamily } from "recoil";

import { equalSelectorFamily } from "../equals";

import { erc20Balances } from "./ethereum/token";
import { solanaFungibleTokenAccounts } from "./solana/token";
import { splTokenRegistry } from "./solana/token-registry";
import { blockchainConnectionUrl } from "./preferences";

const baseCoingeckoParams = {
  vs_currencies: "usd",
  include_market_cap: "true",
  include_24hr_vol: "true",
  include_24hr_change: "true",
  include_last_updated_at: "true",
};

// TODO move this to a remote API so it can be updated without updating
// the app
const coingeckoIdOverride = {
  DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ: "dust-protocol",
  DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: "bonk",
  bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1: "blazestake-staked-sol",
  "5yxNbU8DgYJZNi3mPD9rs4XLh9ckXrhPjJ5VCujUWg5H": "fronk",
  CvB1ztJvpYQPvdPBePtRzjL4aQidjydtUz61NWgcgQtP: "epics-token",
  J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn: "jito-staked-sol",
};

// Coingecko API query for all Coingecko IDs (for Solana).
export const solanaPricesForIds = selectorFamily<
  Map<string, any>,
  { publicKey: string }
>({
  key: "pricesFoIds",
  get:
    ({ publicKey }) =>
    async ({ get }) => {
      const ids = get(coingeckoIds({ publicKey }));
      if (ids.length === 0) return new Map();
      const params = {
        ...baseCoingeckoParams,
        ids,
      } as any;
      const queryString = new URLSearchParams(params).toString();
      try {
        const resp = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?${queryString}`
        );
        const json = await resp.json();
        const coingeckoIdToAddressMap = get(
          coingeckoIdToAddress({ publicKey })
        );
        return new Map(
          // Transform the response from id -> price data to addresss -> price data
          Object.keys(json).map((id) => [
            coingeckoIdToAddressMap.get(id),
            json[id],
          ])
        ) as Map<string, any>;
      } catch (err) {
        console.error("error querying all Coingecko IDs", err);
        return new Map();
      }
    },
});

// Map of SPL mint addresses to Coingecko ID
const splMintsToCoingeckoId = equalSelectorFamily<
  Map<string, string>,
  { publicKey: string }
>({
  key: "splMintsToCoingeckoId",
  get:
    ({ publicKey }: { publicKey: string }) =>
    ({ get }: any) => {
      const connectionUrl = get(blockchainConnectionUrl(Blockchain.SOLANA));
      const _fungibleTokenAccounts = get(
        solanaFungibleTokenAccounts({ connectionUrl, publicKey })
      );
      const tokenRegistry = get(splTokenRegistry);
      return [..._fungibleTokenAccounts.values()].reduce(
        (acc, splTokenAccount) => {
          const mint: keyof typeof coingeckoIdOverride =
            splTokenAccount.mint.toString();
          // Use override if one is available
          if (coingeckoIdOverride[mint]) {
            acc.set(mint, coingeckoIdOverride[mint]);
            return acc;
          }
          const tokenInfo = tokenRegistry.get(mint);
          if (
            tokenInfo &&
            tokenInfo.extensions &&
            tokenInfo.extensions.coingeckoId
          ) {
            acc.set(mint, tokenInfo.extensions.coingeckoId);
          }
          return acc;
        },
        new Map() as Map<string, string>
      );
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
export const addressToCoingeckoId = selectorFamily<
  Map<string, string>,
  { publicKey: string }
>({
  key: "addressToCoingeckoId",
  get:
    ({ publicKey }) =>
    ({ get }: any) => {
      return new Map([
        ...get(splMintsToCoingeckoId({ publicKey })),
        ...get(ethAddressToCoingeckoId),
      ]);
    },
});

// Map of Coingecko IDs to addresses (any blockchain)
export const coingeckoIdToAddress = selectorFamily<
  Map<string, string>,
  { publicKey: string }
>({
  key: "coingeckoIdToAddress",
  get:
    ({ publicKey }) =>
    ({ get }: any) => {
      return new Map(
        [...get(addressToCoingeckoId({ publicKey })).entries()].map(
          ([a, b]) => [b, a]
        )
      );
    },
});

// The list of all Coingecko token IDs prices need to be loaded for.
// This is determined by the list of all tokens in the wallet.
export const coingeckoIds = selectorFamily<
  Array<string>,
  { publicKey: string }
>({
  key: "coingeckoIds",
  get:
    ({ publicKey }) =>
    ({ get }: any) => {
      const allIds = [
        ...get(splMintsToCoingeckoId({ publicKey })).values(),
        ...get(ethAddressToCoingeckoId).values(),
      ].flat();
      // Deduplicate
      return [...new Set(allIds)];
    },
});

// The list of all Ethereum ERC20 contract addresses prices need to be loaded
// for.
export const erc20ContractAddresses = equalSelectorFamily<
  Array<string>,
  { publicKey: string }
>({
  key: "erc20ContractAddresses",
  get:
    ({ publicKey }) =>
    ({ get }: any) => {
      const balances = get(erc20Balances({ publicKey }));
      const addresses = [...balances.keys()].filter(
        // TODO figure out how ETH_NATIVE_MINT ends up in this array
        (k: string) => k !== ETH_NATIVE_MINT
      );
      addresses.sort();
      return addresses;
    },
  equals: (a1, a2) => JSON.stringify(a1) === JSON.stringify(a2),
});

// Coingecko API query for all ERC20 contract addresses
export const pricesForErc20Addresses = selectorFamily<
  Map<string, any>,
  { publicKey: string }
>({
  key: "pricesForErc20Addresses",
  get:
    ({ publicKey }) =>
    async ({ get }: any) => {
      const contractAddresses = get(erc20ContractAddresses({ publicKey }));
      if (contractAddresses.length === 0) {
        // No contract addresses, nothing to query
        return new Map();
      }
      const params = {
        ...baseCoingeckoParams,
        contract_addresses: contractAddresses,
      };
      const queryString = new URLSearchParams(params).toString();
      try {
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
      } catch (err) {
        console.error("error querying all ER20 tokens", err);
        return new Map();
      }
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
    try {
      const resp = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?${queryString}`
      );
      const json = await resp.json();
      return json["ethereum"];
    } catch (err) {
      console.error("error fetching ethereum price:", err);
      return;
    }
  },
});

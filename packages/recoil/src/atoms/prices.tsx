import { atomFamily, selectorFamily } from "recoil";
import { ethers } from "ethers";
import { TokenInfo } from "@solana/spl-token-registry";
import { ETH_NATIVE_MINT } from "@coral-xyz/common";
import { SolanaTokenAccountWithKey, TokenDisplay } from "../types";
import { bootstrap } from "./bootstrap";

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
        const data = get(bootstrap);
        return data.coingeckoData.get(address);
      },
  }),
});

export async function fetchPriceData(
  splTokenAccounts: Map<string, SolanaTokenAccountWithKey>,
  tokenRegistry: Map<string, TokenInfo>,
  ethereumContractAddresses: string[]
) {
  const addressToCoingeckoId = solanaMintToCoingeckoId(
    splTokenAccounts,
    tokenRegistry
  );
  // Include Ethereum native ID
  addressToCoingeckoId.set(ETH_NATIVE_MINT, "ethereum");
  // Reverse lookup table
  const coingeckoIdToAddress = new Map(
    [...addressToCoingeckoId.entries()].map(([a, b]) => [b, a])
  );

  // Deduplicate ids and join in a string
  const coingeckoIds = [...new Set(addressToCoingeckoId.values())].join(",");
  //
  // TODO it'd be nice if we could combine these two queries. The Ethereum
  // token list doesn't have Coingecko IDs, so we need to fetch the IDs
  // which is another query anyway.
  //
  const coingeckoData = await Promise.all([
    fetchPricesById(coingeckoIds),
    fetchEthereumPricesByAddress(ethereumContractAddresses.join(",")),
  ]).then(([byIdResponse, byAddressResponse]) => {
    return new Map([
      // Transform the response from id -> price data to addresss -> price data
      ...new Map(
        Object.keys(byIdResponse).map((id) => [
          coingeckoIdToAddress.get(id),
          byIdResponse[id],
        ])
      ),
      // Transform keys of the response to checksummed addresses
      ...new Map(
        Object.keys(byAddressResponse).map((address) => [
          ethers.utils.getAddress(address),
          byAddressResponse[address],
        ])
      ),
    ]);
  });

  return coingeckoData;
}

async function fetchPricesById(ids: string) {
  if (ids.length === 0) return {};
  const params = {
    ...baseCoingeckoParams,
    ids,
  };
  const queryString = new URLSearchParams(params).toString();
  const resp = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?${queryString}`
  );
  return await resp.json();
}

async function fetchEthereumPricesByAddress(contractAddresses: string) {
  if (contractAddresses.length === 0) return {};
  const params = {
    ...baseCoingeckoParams,
    contract_addresses: contractAddresses,
  };
  const queryString = new URLSearchParams(params).toString();
  const resp = await fetch(
    `https://api.coingecko.com/api/v3/simple/token_price/ethereum?${queryString}`
  );
  return await resp.json();
}

export function solanaMintToCoingeckoId(
  splTokenAccounts: Map<string, SolanaTokenAccountWithKey>,
  tokenRegistry: Map<string, TokenInfo>
): Map<string, string> {
  return [...splTokenAccounts.values()].reduce((acc, splTokenAccount) => {
    const mint = splTokenAccount.mint.toString();
    const tokenInfo = tokenRegistry.get(mint);
    if (tokenInfo && tokenInfo.extensions && tokenInfo.extensions.coingeckoId) {
      acc.set(mint, tokenInfo.extensions.coingeckoId);
    }
    return acc;
  }, new Map());
}

import { atomFamily, selectorFamily } from "recoil";
import { ethers } from "ethers";
import { TokenInfo } from "@solana/spl-token-registry";
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

export async function fetchSolanaPriceData(
  splTokenAccounts: Map<string, SolanaTokenAccountWithKey>,
  tokenRegistry: Map<string, TokenInfo>
): Promise<Map<string, any>> {
  const mintCoingeckoIds = Array.from(splTokenAccounts.keys())
    .map((k) => splTokenAccounts.get(k)!.mint.toString())
    .filter((mint) => tokenRegistry!.get(mint) !== undefined)
    .map((mint) => [mint, tokenRegistry!.get(mint)!.extensions])
    .filter(([, e]: any) => e !== undefined && e.coingeckoId !== undefined)
    .map(([mint, e]: any) => [mint, e!.coingeckoId]);
  const idToMint = new Map(mintCoingeckoIds.map((m) => [m[1], m[0]]));
  const coingeckoIds = Array.from(idToMint.keys()).join(",");
  const coingeckoResp = await fetchPricesByIds(coingeckoIds);
  const coingeckoData = new Map(
    Object.keys(coingeckoResp).map((id) => [
      idToMint.get(id),
      coingeckoResp[id],
    ])
  );
  return coingeckoData;
}

export async function fetchEthereumPriceData(
  contractAddresses: string[]
): Promise<Map<string, any>> {
  if (contractAddresses.length === 0) {
    return new Map();
  }
  const coingeckoResp = await fetchPricesByAddresses(
    contractAddresses.join(",")
  );
  const coingeckoData = new Map(
    Object.keys(coingeckoResp).map((id) => [
      // Coingecko returns non checksummed addresses
      ethers.utils.getAddress(id),
      coingeckoResp[id],
    ])
  );
  return coingeckoData;
}

async function fetchPricesByIds(ids: string) {
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

async function fetchPricesByAddresses(contractAddresses: string) {
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

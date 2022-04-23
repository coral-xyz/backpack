import { atomFamily, selectorFamily } from "recoil";
import { TokenInfo } from "@solana/spl-token-registry";
import { TokenAccountWithKey, TokenDisplay } from ".";
import { bootstrap } from "./bootstrap";

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
  splTokenAccounts: Map<string, TokenAccountWithKey>,
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
  const coingeckoResp = await fetchCoingecko(coingeckoIds);
  const coingeckoData = new Map(
    Object.keys(coingeckoResp).map((id) => [
      idToMint.get(id),
      coingeckoResp[id],
    ])
  );
  return coingeckoData;
}

async function fetchCoingecko(coingeckoId: string) {
  const resp = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`
  );
  return await resp.json();
}

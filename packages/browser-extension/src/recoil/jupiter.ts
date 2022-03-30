import { atom, selector, selectorFamily } from "recoil";
import { TOKEN_LIST_URL } from "@jup-ag/core";
import * as atoms from "./atoms";

// All tokens tradeable on jupiter.
export const jupiterTokenList = selector({
  key: "jupiterTokenList",
  get: async ({}) => {
    const resp = await fetch(TOKEN_LIST_URL["mainnet-beta"]);
    const toks = await resp.json();
    // @ts-ignore
    return toks.map((t) => ({
      ...t,
      mint: t.address,
      logo: t.logoURI,
      ticker: t.symbol,
    }));
  },
});

// Jupiter tokens that can be swapped *from* owned by the currently active
// wallet.
export const walletJupiterTokens = selector({
  key: "walletJupiterTokens",
  get: async ({ get }) => {
    const jupTokens = get(jupiterTokenList);
    const tokens = get(atoms.blockchainTokensSorted("solana"));

    // Only allow tokens that jupiter allows.
    return tokens.filter((t: any) => {
      return jupTokens.find((j: any) => j.address === t.mint);
    });
  },
});

export const swapTokenList = selectorFamily({
  key: "swapTokenList",
  get:
    ({ mint, isFrom }: { mint: string; isFrom: boolean }) =>
    ({ get }: any) => {
      if (isFrom) {
        return get(walletJupiterTokens);
      } else {
        const tokenList = get(jupiterTokenList);
        const walletTokens = get(atoms.blockchainTokensSorted("solana"));
        // @ts-ignore
        return (
          tokenList
            // @ts-ignore
            .filter(
              // @ts-ignore
              (t) =>
                WHITELIST.find((wl) => wl === t.mint) !== undefined &&
                t.mint !== mint
            )
            // @ts-ignore
            .map((t) => {
              // @ts-ignore
              const found = walletTokens.find(
                // @ts-ignore
                (walletToken) => walletToken.mint === t.mint
              );
              if (found)
                return {
                  ...t,
                  ...found,
                };
              return t;
            })
        );
      }
    },
});

const WHITELIST = [
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
  "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt", // SRM
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", // RAY
  "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E", // BTC
  "EzfgjvkSwthhgHaceR3LnKXUoRkP6NUhfghdaHAj1tUv", // FTT
  "ChVzxWRmrTeSgwd3Ui3UumcN8KX7VK3WaD4KGeSKpypj", // SUSHI
  "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs", // ETH
  "2wpTofQ8SkACrkZWrZDjXPitYa8AwWgX8AfxdeBRRVLX", // LINK
  "BXZX2JRJFjvKazM1ibeDFxgAngKExb74MRXzXKvgikxX", // YFI
];

import { atom, atomFamily, selector, selectorFamily } from "recoil";
import { bootstrap } from "./bootstrap";
import { priceData } from "./price-data";
import { splTokenRegistry } from "./token-registry";
import { TokenAccountWithKey } from "../types";
import { connectionUrl, activeWallet, anchorContext } from "./wallet";

/**
 * Returns the token accounts sorted by usd notional balances.
 */
export const blockchainTokensSorted = selectorFamily({
  key: "blockchainTokensSorted",
  get:
    (blockchain: string) =>
    ({ get }: any) => {
      const tokenAddresses = get(
        blockchainTokens({
          publicKey: get(activeWallet),
          connectionUrl: get(connectionUrl),
          blockchain,
        })
      );
      const tokenAccounts = tokenAddresses.map((address: string) =>
        get(
          blockchainTokenAccounts({
            address,
            connectionUrl: get(connectionUrl),
            blockchain,
          })
        )
      );
      // @ts-ignore
      return tokenAccounts.sort((a, b) => b.usdBalance - a.usdBalance);
    },
});

/**
 * Selects a blockchain token list based on a network string.
 */
export const blockchainTokens = selectorFamily({
  key: "blockchainTokens",
  get:
    ({
      blockchain,
      connectionUrl,
      publicKey,
    }: {
      blockchain: string;
      connectionUrl: string;
      publicKey: string;
    }) =>
    ({ get }: any) => {
      switch (blockchain) {
        case "solana":
          return get(solanaTokenAccountKeys({ connectionUrl, publicKey }));
        default:
          throw new Error("invariant violation");
      }
    },
});

export const blockchainTokenAccounts = selectorFamily({
  key: "blockchainTokenAccountsMap",
  get:
    ({
      address,
      connectionUrl,
      blockchain,
    }: {
      address: string;
      connectionUrl: string;
      blockchain: string;
    }) =>
    ({ get }: any) => {
      switch (blockchain) {
        case "solana":
          const tokenAccount = get(
            solanaTokenAccountsMap({ connectionUrl, tokenAddress: address })
          );
          if (!tokenAccount) {
            return null;
          }
          //
          // Token registry metadata.
          //
          const tokenRegistry = get(splTokenRegistry);
          const tokenMetadata =
            tokenRegistry.get(tokenAccount.mint.toString()) ?? {};
          const ticker = tokenMetadata.symbol;
          const logo = tokenMetadata.logoURI;
          const name = tokenMetadata.name;

          //
          // Price data.
          //
          const price = get(priceData(tokenAccount.mint.toString()));
          const nativeBalance = tokenMetadata.decimals
            ? tokenAccount.amount.toNumber() / 10 ** tokenMetadata.decimals
            : tokenAccount.amount.toNumber();
          const currentUsdBalance =
            price && price.usd ? price.usd * nativeBalance : 0;
          const oldUsdBalance =
            currentUsdBalance === 0
              ? 0
              : currentUsdBalance / (1 + price.usd_24h_change);
          const recentUsdBalanceChange =
            (currentUsdBalance - oldUsdBalance) / oldUsdBalance;
          const recentPercentChange = price
            ? parseFloat(price.usd_24h_change.toFixed(2))
            : undefined;

          return {
            name,
            nativeBalance,
            ticker,
            logo,
            address,
            mint: tokenAccount.mint.toString(),
            usdBalance: currentUsdBalance,
            recentPercentChange,
            recentUsdBalanceChange,
            priceData: price,
          };
        default:
          throw new Error("invariant violation");
      }
    },
});

/**
 * List of all stored token accounts within tokenAccountsMap.
 */
export const solanaTokenAccountKeys = atomFamily<
  Array<string>,
  { connectionUrl: string; publicKey: string }
>({
  key: "solanaTokenAccountKeys",
  default: selectorFamily({
    key: "solanaTokenAccountKeysDefault",
    get:
      ({
        connectionUrl,
        publicKey,
      }: {
        connectionUrl: string;
        publicKey: string;
      }) =>
      ({ get }: any) => {
        const data = get(bootstrap({ connectionUrl, publicKey }));
        return Array.from(data.splTokenAccounts.keys()) as string[];
      },
  }),
});

/**
 * Store the info from the SPL Token Account owned by the connected wallet.
 */
export const solanaTokenAccountsMap = atomFamily<
  TokenAccountWithKey | null,
  { connectionUrl: string; tokenAddress: string }
>({
  key: "solanaTokenAccountsMap",
  default: selectorFamily({
    key: "solanaTokenAccountsMapDefault",
    get:
      ({
        connectionUrl,
        tokenAddress,
      }: {
        connectionUrl: string;
        tokenAddress: string;
      }) =>
      ({ get }: any) => {
        const publicKey = get(activeWallet);
        const data = get(bootstrap({ connectionUrl, publicKey }));
        return data.splTokenAccounts.get(tokenAddress);
      },
  }),
});

//
// Token account address for all nfts.
//
export const solanaNftMetadataKeys = atom<Array<string>>({
  key: "solanaNftKeys",
  default: selector({
    key: "solanaNftKeysDefault",
    get: ({ get }: any) => {
      const publicKey = get(activeWallet);
      const { connectionUrl } = get(anchorContext);
      const b = get(bootstrap({ publicKey, connectionUrl }));
      return Array.from(b.splNftMetadata.keys());
    },
  }),
});

//
// Full token metadata for all nfts.
//
export const solanaNftMetadataMap = atomFamily<any, string>({
  key: "solanaNftMap",
  default: selectorFamily({
    key: "solanaNftMapDefault",
    get:
      (tokenAddress: string) =>
      ({ get }: any) => {
        const publicKey = get(activeWallet);
        const { connectionUrl } = get(anchorContext);
        const b = get(bootstrap({ publicKey, connectionUrl }));
        return b.splNftMetadata.get(tokenAddress);
      },
  }),
});

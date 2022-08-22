import { atomFamily, selectorFamily } from "recoil";
import { ethers, BigNumber } from "ethers";
import { TokenInfo } from "@solana/spl-token-registry";
import { Blockchain, SOL_NATIVE_MINT, WSOL_MINT } from "@coral-xyz/common";
import { bootstrap } from "../bootstrap";
import { priceData } from "../prices";
import { splTokenRegistry } from "./token-registry";
import { TokenAccountWithKey } from "../../types";
import { activeWallet } from "../wallet";
import { solanaConnectionUrl } from "./preferences";

/**
 * Returns the token accounts sorted by usd notional balances.
 */
export const blockchainTokensSorted = selectorFamily({
  key: "blockchainTokensSorted",
  get:
    (blockchain: Blockchain) =>
    ({ get }) => {
      const tokenAddresses = get(blockchainTokens(blockchain));
      const tokenAccounts = tokenAddresses
        .map(
          (address) =>
            get(
              blockchainTokenAccounts({
                address,
                blockchain,
              })
            )!
        )
        .filter(Boolean);
      return tokenAccounts.sort((a, b) => b.usdBalance - a.usdBalance);
    },
});

/**
 * Selects a blockchain token list based on a network string.
 */
export const blockchainTokens = selectorFamily({
  key: "blockchainTokens",
  get:
    (blockchain: Blockchain) =>
    ({ get }) => {
      switch (blockchain) {
        case Blockchain.SOLANA:
          return get(
            solanaTokenAccountKeys({
              connectionUrl: get(solanaConnectionUrl)!,
              publicKey: get(activeWallet)!,
            })
          );
        default:
          throw new Error("invariant violation");
      }
    },
});

export const blockchainTokenAccounts = selectorFamily({
  key: "blockchainTokenAccountsMap",
  get:
    ({ address, blockchain }: { address: string; blockchain: Blockchain }) =>
    ({ get }) => {
      switch (blockchain) {
        case Blockchain.SOLANA:
          const tokenAccount = get(
            solanaTokenAccountsMap({
              connectionUrl: get(solanaConnectionUrl)!,
              tokenAddress: address,
            })
          );
          if (!tokenAccount) {
            return null;
          }
          //
          // Token registry metadata.
          //
          const tokenRegistry = get(splTokenRegistry)!;
          const tokenMetadata =
            tokenRegistry.get(tokenAccount.mint.toString()) ??
            ({} as TokenInfo);
          const ticker = tokenMetadata.symbol;
          const logo = tokenMetadata.logoURI;
          const name = tokenMetadata.name;

          //
          // Price data.
          //

          // Use native SOL price for wSOL
          const priceMint =
            tokenAccount.mint.toString() === WSOL_MINT
              ? SOL_NATIVE_MINT
              : tokenAccount.mint.toString();
          const price = get(priceData(priceMint)) as any;
          const decimals = tokenMetadata.decimals;
          // Convert from BN.js to ethers BigNumber
          // https://github.com/ethers-io/ethers.js/issues/595
          const nativeBalance = BigNumber.from(tokenAccount.amount.toString());
          const displayBalance = ethers.utils.formatUnits(
            nativeBalance,
            decimals
          );
          const currentUsdBalance =
            price && price.usd
              ? price.usd * nativeBalance.div(10 ** decimals).toNumber()
              : 0;
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
            decimals,
            nativeBalance,
            displayBalance,
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
        const data = get(bootstrap);
        return Array.from(data.splTokenAccounts.keys()) as string[];
      },
  }),
});

/**
 * Store the info from the SPL Token Account owned by the connected wallet.
 */
export const solanaTokenAccountsMap = atomFamily<
  SolanaTokenAccountWithKey | null,
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
        const data = get(bootstrap);
        return data.splTokenAccounts.get(tokenAddress);
      },
  }),
});

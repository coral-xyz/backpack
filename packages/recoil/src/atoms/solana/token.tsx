import { atomFamily, selector, selectorFamily } from "recoil";
import { ethers, BigNumber } from "ethers";
import { TokenInfo } from "@solana/spl-token-registry";
import { priceData } from "../prices";
import { splTokenRegistry } from "./token-registry";
import { TokenData, TokenNativeData } from "../../types";
import { anchorContext } from "./wallet";
import { solanaPublicKey } from "../wallet";
import { solanaConnectionUrl } from "./preferences";
import { PublicKey } from "@solana/web3.js";
import { SOL_NATIVE_MINT, WSOL_MINT } from "@coral-xyz/common";
import type {
  SolanaTokenAccountWithKeyString,
  SplNftMetadataString,
  TokenMetadataString,
} from "@coral-xyz/common";

// TODO(peterpme): this is the broken function!
export const customSplTokenAccounts = atomFamily({
  key: "customSplTokenAccounts",
  default: selectorFamily({
    key: "customSplTokenAccountsDefault",
    get:
      ({
        connectionUrl,
        publicKey,
      }: {
        connectionUrl: string;
        publicKey: string;
      }) =>
      async ({
        get,
      }): Promise<{
        splTokenAccounts: Map<String, SolanaTokenAccountWithKeyString>;
        splTokenMetadata: (TokenMetadataString | null)[];
        splNftMetadata: Map<string, SplNftMetadataString>;
      }> => {
        console.log(
          "5 bb: customSplTokenAccounts: publicKey, connectionUrl",
          publicKey,
          connectionUrl
        );
        const { connection } = get(anchorContext);
        //
        // Fetch token data.
        //
        try {
          const { tokenAccountsMap, tokenMetadata, nftMetadata } =
            await connection.customSplTokenAccounts(new PublicKey(publicKey));
          const pp = tokenAccountsMap[0][1].mint as any;
          console.log("6 bb: ptt tokenAccounts pp typeof", typeof pp);
          // console.log("ptt tokenAccounts pp", pp._bn);
          // console.log("ptt tokenAccounts pp.toBase58", pp.toBase58());
          // console.log("ptt tokenAccountsMap, tokenMetadata, nftMetadata", {
          //   tokenAccountsMap,
          //   tokenMetadata,
          //   nftMetadata,
          // });
          console.log("7 bb: ptt tokenAccountsMap", tokenAccountsMap);
          console.log("8 bb: ptt tokenAccountsMap[0]", tokenAccountsMap[0]);
          console.log("9 bb: ptt tokenAccountsMap[1]", tokenAccountsMap[1]);
          // console.log('ptt tokenAccountsMap[0][1]', tokenAccountsMap[0][1])

          // console.log('ptt tokenAccountsMap[0][1].mint', tokenAccountsMap[0][1].mint)
          // console.log('ptt tokenAccountsMap[0][1].mint._bn', tokenAccountsMap[0][1].mint._bn)
          // console.log('ptt tokenAccountsMap[0][1].mint._bn.toString()', tokenAccountsMap[0][1].mint._bn.toString())
          // console.log('ptt tokenAccountsMap[0][1].mint._bn.toBase58()', tokenAccountsMap[0][1].mint._bn.toBase58())
          const splTokenAccounts = new Map(tokenAccountsMap);
          return {
            splTokenAccounts,
            splTokenMetadata: tokenMetadata,
            splNftMetadata: new Map(nftMetadata),
          };
        } catch (error) {
          console.error("could not fetch solana token data", error);
          return {
            splTokenAccounts: new Map(),
            splTokenMetadata: [],
            splNftMetadata: new Map(),
          };
        }
      },
  }),
});

/**
 * Store the info from the SPL Token Account owned by the connected wallet.
 */
export const solanaTokenAccountsMap = atomFamily<
  SolanaTokenAccountWithKeyString | undefined,
  { tokenAddress: string }
>({
  key: "solanaTokenAccountsMap",
  default: selectorFamily({
    key: "solanaTokenAccountsMapDefault",
    get:
      ({ tokenAddress }: { tokenAddress: string }) =>
      ({ get }) => {
        console.log("ptt solanaTokenAccountsMap tokenAddress", tokenAddress);

        const connectionUrl = get(solanaConnectionUrl)!;
        const publicKey = get(solanaPublicKey)!;
        const { splTokenAccounts } = get(
          customSplTokenAccounts({ connectionUrl, publicKey })
        );

        return splTokenAccounts.get(tokenAddress);
      },
  }),
});

/**
 * List of all stored token accounts within tokenAccountsMap.
 */
export const solanaTokenAccountKeys = selector({
  key: "solanaTokenAccountKeys",
  get: ({ get }) => {
    console.log("3 bb: solanaTokenAccountKeys");
    const connectionUrl = get(solanaConnectionUrl)!;
    const publicKey = get(solanaPublicKey)!;
    console.log("4 bb: publicKey", publicKey);
    const { splTokenAccounts } = get(
      customSplTokenAccounts({ connectionUrl, publicKey })
    );
    console.log("10 bb: splTokenAccounts", splTokenAccounts);
    return Array.from(splTokenAccounts.keys()) as string[];
  },
});

export const solanaTokenNativeBalance = selectorFamily<
  TokenNativeData | null,
  string
>({
  key: "solanaTokenNativeBalance",
  get:
    (tokenAddress: string) =>
    ({ get }: any) => {
      const tokenAccount = get(solanaTokenAccountsMap({ tokenAddress }));
      if (!tokenAccount) {
        return null;
      }
      const tokenRegistry = get(splTokenRegistry)!;
      const tokenMetadata =
        tokenRegistry.get(tokenAccount.mint.toString()) ?? ({} as TokenInfo);
      const { symbol: ticker, logoURI: logo, name, decimals } = tokenMetadata;
      const nativeBalance = BigNumber.from(tokenAccount.amount.toString());
      const displayBalance = ethers.utils.formatUnits(nativeBalance, decimals);

      const priceMint =
        tokenAccount.mint.toString() === WSOL_MINT
          ? SOL_NATIVE_MINT
          : tokenAccount.mint.toString();

      return {
        name,
        decimals,
        nativeBalance,
        displayBalance,
        ticker,
        logo,
        address: tokenAddress,
        mint: tokenAccount.mint.toString(),
        priceMint,
      };
    },
});

export const solanaTokenBalance = selectorFamily<TokenData | null, string>({
  key: "solanaTokenBalance",
  get:
    (tokenAddress: string) =>
    ({ get }: any) => {
      const nativeTokenBalance = get(solanaTokenNativeBalance(tokenAddress));
      if (!nativeTokenBalance) {
        return null;
      }

      const price = get(priceData(nativeTokenBalance.priceMint)) as any;
      const usdBalance =
        (price?.usd ?? 0) * parseFloat(nativeTokenBalance.displayBalance);
      const oldUsdBalance =
        usdBalance === 0
          ? 0
          : usdBalance - usdBalance * (price.usd_24h_change / 100);
      const recentUsdBalanceChange = usdBalance - oldUsdBalance;
      const recentPercentChange =
        price && price.usd_24h_change
          ? parseFloat(price.usd_24h_change.toFixed(2))
          : undefined;

      return {
        ...nativeTokenBalance,
        usdBalance,
        recentPercentChange,
        recentUsdBalanceChange,
        priceData: price,
      };
    },
});

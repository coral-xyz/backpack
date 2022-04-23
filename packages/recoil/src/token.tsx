import BN from "bn.js";
import { atom, atomFamily, selector, selectorFamily } from "recoil";
import { PublicKey } from "@solana/web3.js";
import { TokenListProvider, TokenInfo } from "@solana/spl-token-registry";
import { Provider, Program, SplToken } from "@project-serum/anchor";
import * as anchor from "@project-serum/anchor";
import { metadata } from "@project-serum/token";
import { bootstrap } from "./bootstrap";
import { priceData } from "./price-data";
import { TokenAccountWithKey } from ".";

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

/**
 * Returns the token accounts sorted by usd notional balances.
 */
export const blockchainTokensSorted = selectorFamily({
  key: "blockchainTokensSorted",
  get:
    (blockchain: string) =>
    ({ get }: any) => {
      const tokenAddresses = get(blockchainTokens(blockchain));
      const tokenAccounts = tokenAddresses.map((address: string) =>
        get(
          blockchainTokenAccounts({
            address,
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
    (b: string) =>
    ({ get }: any) => {
      switch (b) {
        case "solana":
          return get(solanaTokenAccountKeys);
        default:
          throw new Error("invariant violation");
      }
    },
});

export const blockchainTokenAccounts = selectorFamily({
  key: "blockchainTokenAccountsMap",
  get:
    ({ address, blockchain }: { address: string; blockchain: string }) =>
    ({ get }: any) => {
      switch (blockchain) {
        case "solana":
          const tokenAccount = get(solanaTokenAccountsMap(address));
          if (!tokenAccount) {
            return null;
          }
          const tokenRegistry = get(splTokenRegistry);
          const price = get(priceData(tokenAccount.mint.toString()));
          const tokenMetadata =
            tokenRegistry.get(tokenAccount.mint.toString()) ?? {};
          const ticker = tokenMetadata.symbol;
          const logo = tokenMetadata.logoURI;
          const name = tokenMetadata.name;
          const nativeBalance = tokenAccount.amount
            .div(
              tokenMetadata.decimals
                ? new BN(10 ** tokenMetadata.decimals)
                : new BN(1)
            )
            .toNumber();
          const currentUsdBalance =
            price && price.usd ? price.usd * nativeBalance : 0;
          const oldUsdBalance =
            currentUsdBalance === 0
              ? 0
              : currentUsdBalance / (1 + price.usd_24h_change);
          const recentUsdBalanceChange =
            (currentUsdBalance - oldUsdBalance) / oldUsdBalance;
          return {
            name,
            nativeBalance,
            ticker,
            logo,
            address,
            mint: tokenAccount.mint.toString(),
            usdBalance: currentUsdBalance,
            recentPercentChange: price
              ? parseFloat(price.usd_24h_change.toFixed(2))
              : undefined,
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
export const solanaTokenAccountKeys = atom<Array<string>>({
  key: "solanaTokenAccountKeys",
  default: selector({
    key: "solanaTokenAccountKeysDefault",
    get: ({ get }: any) => {
      const data = get(bootstrap);
      return Array.from(data.splTokenAccounts.keys()) as string[];
    },
  }),
});

/**
 * Store the info from the SPL Token Account owned by the connected wallet.
 */
export const solanaTokenAccountsMap = atomFamily<
  TokenAccountWithKey | null,
  string
>({
  key: "solanaTokenAccountsMap",
  default: selectorFamily({
    key: "solanaTokenAccountsMapDefault",
    get:
      (address: string) =>
      ({ get }: any) => {
        const data = get(bootstrap);
        return data.splTokenAccounts.get(address);
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
      const b = get(bootstrap);
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
        const b = get(bootstrap);
        return b.splNftMetadata.get(tokenAddress);
      },
  }),
});

export const splTokenRegistry = atom<Map<string, TokenInfo> | null>({
  key: "splTokenRegistry",
  default: null,
  effects: [
    ({ setSelf }) => {
      setSelf(
        new TokenListProvider().resolve().then((tokens) => {
          const tokenList = tokens
            .filterByClusterSlug("mainnet-beta") // TODO: get network atom.
            .getList();
          return tokenList.reduce((map, item) => {
            map.set(item.address, item);
            return map;
          }, new Map());
        })
      );
    },
  ],
});

export async function fetchSplMetadata(
  provider: Provider,
  tokens: Array<TokenAccountWithKey>
): Promise<Array<null | { publicKey: PublicKey; account: any }>> {
  //
  // Fetch metadata for each token.
  //
  const metaAddrs = await Promise.all(
    tokens.map(async (t: any) => {
      return {
        token: t,
        publicKey: t.key,
        metadataAddress: await metadataAddress(t.mint),
      };
    })
  );
  const tokenMetaAccounts = (
    await anchor.utils.rpc.getMultipleAccounts(
      provider.connection,
      metaAddrs.map((t: any) => t.metadataAddress)
    )
  ).map((t) =>
    t
      ? {
          publicKey: t!.publicKey,
          account: metadata.decodeMetadata(t!.account.data),
        }
      : null
  );

  return tokenMetaAccounts;
}

export async function fetchSplMetadataUri(
  tokens: Array<TokenAccountWithKey>,
  splTokenMetadata: Array<any>
): Promise<Map<string, any>> {
  //
  // Fetch the URI for each metadata.
  //
  const tokenMetaUriData = await Promise.all(
    splTokenMetadata
      // @ts-ignore
      .map(async (t) => {
        if (t === null || t === undefined || !t.account.data.uri) {
          return null;
        }
        try {
          // @ts-ignore
          const resp = await fetch(t.account.data.uri);
          return resp.json();
        } catch (err) {
          console.log(err);
        }
      })
  );

  //
  // Zip it all together.
  //
  const splNftMetadata: Map<string, any> = new Map(
    // @ts-ignore
    tokens
      // @ts-ignore
      .map((m, idx) => {
        const tokenMetadata = splTokenMetadata[idx];
        if (!tokenMetadata) {
          return null;
        }
        if (!tokenMetaUriData[idx]) {
          return null;
        }
        return [
          m.key.toString(),
          {
            publicKey: m.key,
            metadataAddress: tokenMetadata.publicKey,
            metadata: tokenMetadata.account,
            tokenMetaUriData: tokenMetaUriData[idx],
          },
        ];
      })
      // @ts-ignore
      .filter((m) => m !== null)
  );

  //
  // Done.
  //
  return splNftMetadata;
}

async function metadataAddress(mint: PublicKey): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )
  )[0];
}

export async function fetchTokens(
  walletPublicKey: PublicKey,
  tokenClient: Program<SplToken>
): Promise<Map<string, TokenAccountWithKey>> {
  //
  // Fetch the accounts.
  //
  const resp = await tokenClient.provider.connection.getTokenAccountsByOwner(
    walletPublicKey,
    {
      programId: tokenClient.programId,
    }
  );
  //
  // Decode the data.
  //
  const tokens: Array<[string, TokenAccountWithKey]> = resp.value.map(
    ({ account, pubkey }: any) => [
      pubkey.toString(),
      {
        ...tokenClient.coder.accounts.decode("token", account.data),
        key: pubkey,
      },
    ]
  );
  //
  // Filter out any invalid tokens.
  //
  const validTokens = tokens.filter(([, t]) => t.amount.toNumber() >= 1);
  //
  // Done.
  //
  return new Map(validTokens);
}

import { atom, atomFamily, selector, selectorFamily } from "recoil";
import { TokenListProvider, TokenInfo } from "@solana/spl-token-registry";
import { TokenAccountWithKey } from "./types";
import {
  UI_RPC_METHOD_CONNECTION_URL_READ,
  UI_RPC_METHOD_CONNECTION_URL_UPDATE,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
  UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET,
  UI_RPC_METHOD_KEYRING_STORE_STATE,
} from "../common";
import { getBackgroundClient } from "../background/client";
import { WalletPublicKeys, BlockchainBalance, TokenDisplay } from "./types";
import { KeyringStoreState } from "../keyring/store";

export const didBootstrap = atom<boolean>({
  key: "didBootstrap",
  default: false,
  effects: [
    ({ setSelf }) => {
      setSelf(true);
    },
  ],
});

/**
 * Toggle for darkmode.
 */
export const isDarkMode = atom<boolean>({
  key: "isDarkMode",
  default: false,
});

/**
 * Status of the keyring store.
 */
export const keyringStoreState = atom<KeyringStoreState | null>({
  key: "keyringStoreState",
  default: null,
  effects: [
    ({ setSelf }) => {
      const background = getBackgroundClient();
      setSelf(
        background.request({
          method: UI_RPC_METHOD_KEYRING_STORE_STATE,
          params: [],
        })
      );
    },
  ],
});

/**
 * List of all public keys for the wallet along with associated nicknames.
 */
export const walletPublicKeys = atom<WalletPublicKeys>({
  key: "walletPublicKeys",
  default: { hdPublicKeys: [], importedPublicKeys: [] },
  effects: [
    ({ setSelf }) => {
      const background = getBackgroundClient();
      setSelf(
        background.request({
          method: UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
          params: [],
        })
      );
    },
  ],
});

/**
 * Pubkey of the currently selected wallet.
 */
export const activeWallet = atom<string | null>({
  key: "activeWallet",
  default: null,
  effects: [
    ({ setSelf }) => {
      const background = getBackgroundClient();
      setSelf(
        background.request({
          method: UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET,
          params: [],
        })
      );
    },
  ],
});

/**
 * Currently selected wallet with display data.
 */
export const activeWalletWithName = selector({
  key: "filteredTodoListState",
  get: ({ get }) => {
    const active = get(activeWallet);
    const pks = get(walletPublicKeys);
    let result = pks.hdPublicKeys.find(
      (pk) => pk.publicKey.toString() === active
    );
    if (result) {
      return result;
    }
    result = pks.importedPublicKeys.find(
      (pk) => pk.publicKey.toString() === active
    );

    return result;
  },
});

/**
 * URL to the cluster to communicate with.
 */
// TODO: this needs to be an atom family keyed on blockchain label.
const DEFAULT_CONNECTION_URL = "https://solana-api.projectserum.com";
export const connectionUrlAtom = atom<string>({
  key: "clusterConnection",
  default: DEFAULT_CONNECTION_URL,
  effects: [
    ({ setSelf }) => {
      const background = getBackgroundClient();
      setSelf(
        background
          .request({
            method: UI_RPC_METHOD_CONNECTION_URL_READ,
            params: [],
          })
          .then((result) => result ?? DEFAULT_CONNECTION_URL)
      );
    },
    ({ onSet }) => {
      onSet((cluster) => {
        // TODO: do we want to handle this via notification instead?
        const background = getBackgroundClient();
        background
          .request({
            method: UI_RPC_METHOD_CONNECTION_URL_UPDATE,
            params: [cluster],
          })
          .catch(console.error);
      });
    },
  ],
});

/**
 * All blockchains.
 */
export const blockchainKeys = atom<Array<string>>({
  key: "blockchainKeys",
  default: ["solana"],
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

// TODO: we need to get mint atoms somewhere so that we have the decimals
export const blockchainTokenAccounts = selectorFamily({
  key: "blockchainTokenAccountsMap",
  get:
    ({ address, blockchain }: { address: string; blockchain: string }) =>
    ({ get }: any) => {
      switch (blockchain) {
        case "solana":
          const tokenRegistry = get(splTokenRegistry);
          const tokenAccount = get(solanaTokenAccountsMap(address));
          const tokenMetadata =
            tokenRegistry.get(tokenAccount.mint.toString()) ?? {};
          const ticker = tokenMetadata.symbol;
          const logo = tokenMetadata.logoURI;
          const name = tokenMetadata.name;
          const nativeBalance =
            tokenAccount.amount / (tokenMetadata.decimals ?? 1);
          return {
            name,
            nativeBalance,
            ticker,
            logo,
            usdBalance: "0", // todo
            recentUsdBalanceChange: "0", // todo
          };
        default:
          throw new Error("invariant violation");
      }
    },
});

//export const blockchainTokenBalance =

/**
 * List of all stored token accounts within tokenAccountsMap.
 */
export const solanaTokenAccountKeys = atom<string[]>({
  key: "solanaTokenAccountKeys",
  default: [],
});

/**
 * Store the info from the SPL Token Account owned by the connected wallet.
 */
export const solanaTokenAccountsMap = atomFamily<
  TokenAccountWithKey | null,
  string
>({
  key: "solanaTokenAccountsMap",
  default: null,
});

export const splTokenRegistry = atom<Map<string, TokenInfo> | null>({
  key: "splTokenRegistry",
  default: null,
  effects: [
    ({ setSelf }) => {
      setSelf(
        new TokenListProvider().resolve().then((tokens) => {
          const tokenList = tokens
            .filterByClusterSlug("mainnet-beta")
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

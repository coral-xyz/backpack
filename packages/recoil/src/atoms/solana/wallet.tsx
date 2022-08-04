import { atom, selector } from "recoil";
import { Provider, Spl } from "@project-serum/anchor";
import {
  BackgroundSolanaConnection,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
  UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET,
} from "@coral-xyz/common";
import { WalletPublicKeys } from "../../types";
import { backgroundClient, connectionBackgroundClient } from "../client";
import { solanaCommitment, connectionUrl } from "../preferences";

/**
 * List of all public keys for the wallet along with associated nicknames.
 */
export const walletPublicKeys = atom<WalletPublicKeys>({
  key: "walletPublicKeys",
  default: selector({
    key: "walletPublicKeysDefault",
    get: async ({ get }) => {
      const background = get(backgroundClient);
      return await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
        params: [],
      });
    },
  }),
});

/**
 * Pubkey of the currently selected wallet.
 */
export const activeWallet = atom<string | null>({
  key: "activeWallet",
  default: selector({
    key: "activeWalletDefault",
    get: async ({ get }) => {
      const background = get(backgroundClient);
      return await background.request({
        method: UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET,
        params: [],
      });
    },
  }),
});

/**
 * Currently selected wallet with display data.
 */
export const activeWalletWithName = selector({
  key: "activeWalletWithName",
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
    if (result) {
      return result;
    }
    result = pks.ledgerPublicKeys.find(
      (pk) => pk.publicKey.toString() === active
    );
    return result;
  },
});

export const anchorContext = selector({
  key: "anchorContext",
  get: async ({ get }: any) => {
    const _connectionUrl = get(connectionUrl);
    const _connectionBackgroundClient = get(connectionBackgroundClient);
    const connection = new BackgroundSolanaConnection(
      _connectionBackgroundClient,
      _connectionUrl
    );
    const _commitment = get(solanaCommitment);
    // Note: this provider is *read-only*.
    //
    // @ts-ignore
    const provider = new Provider(connection, undefined, {
      skipPreflight: false,
      commitment: _commitment,
      preflightCommitment: _commitment,
    });
    const tokenClient = Spl.token(provider);
    return {
      connection,
      connectionUrl: _connectionUrl,
      provider,
      tokenClient,
    };
  },
});

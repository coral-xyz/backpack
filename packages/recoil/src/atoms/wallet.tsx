import { atom, selector } from "recoil";
import { Commitment } from "@solana/web3.js";
import { Provider, Spl } from "@project-serum/anchor";
import {
  getBackgroundClient,
  BackgroundSolanaConnection,
  PortChannel,
  SOLANA_CONNECTION_RPC_UI,
  UI_RPC_METHOD_CONNECTION_URL_READ,
  UI_RPC_METHOD_CONNECTION_URL_UPDATE,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
  UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET,
  UI_RPC_METHOD_SOLANA_COMMITMENT_READ,
  UI_RPC_METHOD_SOLANA_COMMITMENT_UPDATE,
} from "@200ms/common";
import { WalletPublicKeys } from "../types";

/**
 * List of all public keys for the wallet along with associated nicknames.
 */
export const walletPublicKeys = atom<WalletPublicKeys>({
  key: "walletPublicKeys",
  default: selector({
    key: "walletPublicKeysDefault",
    get: async ({}) => {
      const background = getBackgroundClient();
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
    get: async ({}) => {
      const background = getBackgroundClient();
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

export const connectionBackgroundClient = selector({
  key: "connectionBackgroundClient",
  get: ({ get }) => {
    return PortChannel.client(SOLANA_CONNECTION_RPC_UI);
  },
});

/**
 * URL to the cluster to communicate with.
 */
export const connectionUrl = atom<string | null>({
  key: "clusterConnection",
  default: selector({
    key: "clusterConnectionDefault",
    get: ({ get }) => {
      const background = getBackgroundClient();
      return background.request({
        method: UI_RPC_METHOD_CONNECTION_URL_READ,
        params: [],
      });
    },
  }),
  effects: [
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

export const anchorContext = selector({
  key: "anchorContext",
  get: async ({ get }: any) => {
    const _connectionUrl = get(connectionUrl);
    const _connectionBackgroundClient = get(connectionBackgroundClient);
    const connection = new BackgroundSolanaConnection(
      _connectionBackgroundClient,
      _connectionUrl
    );
    const _commitment = get(commitment);
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

export const commitment = atom<Commitment>({
  key: "solanaCommitment",
  default: "processed",
  effects: [
    ({ setSelf }) => {
      const background = getBackgroundClient();
      setSelf(
        background.request({
          method: UI_RPC_METHOD_SOLANA_COMMITMENT_READ,
          params: [],
        })
      );
    },
    ({ onSet }) => {
      onSet((commitment) => {
        const background = getBackgroundClient();
        background
          .request({
            method: UI_RPC_METHOD_SOLANA_COMMITMENT_UPDATE,
            params: [commitment],
          })
          .catch(console.error);
      });
    },
  ],
});

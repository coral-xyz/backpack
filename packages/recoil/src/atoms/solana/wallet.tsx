import { AnchorProvider } from "@coral-xyz/anchor";
import { Blockchain } from "@coral-xyz/common";
import {
  BackgroundSolanaConnection,
  TokenInterface,
} from "@coral-xyz/secure-clients/legacyCommon";
import { Keypair } from "@solana/web3.js";
import { selector } from "recoil";

import { connectionBackgroundClient } from "../client";
import { blockchainCommitment, blockchainConnectionUrl } from "../preferences";

export const anchorContext = selector({
  key: "anchorContext",
  get: ({ get }) => {
    // TODO: need to generalize this for SVM/eclipse.
    const _connectionUrl = get(blockchainConnectionUrl(Blockchain.SOLANA));
    const _connectionBackgroundClient = get(connectionBackgroundClient);
    const commitment = get(blockchainCommitment(Blockchain.SOLANA));
    const connectionUrl = get(blockchainConnectionUrl(Blockchain.SOLANA));
    const connection = new BackgroundSolanaConnection(
      _connectionBackgroundClient,
      _connectionUrl
    );

    //
    // Note: this provider is *read-only*.
    //
    const dummyWallet = Keypair.generate();
    // @ts-ignore
    const provider = new AnchorProvider(connection, dummyWallet, {
      skipPreflight: false,
      commitment: commitment,
      preflightCommitment: commitment,
    });
    const tokenInterface = new TokenInterface(provider);
    return {
      connection,
      connectionUrl,
      provider,
      tokenInterface,
    };
  },
});

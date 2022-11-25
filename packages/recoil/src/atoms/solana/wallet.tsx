import { selector } from "recoil";
import { AnchorProvider, Spl } from "@project-serum/anchor";
import { Keypair } from "@solana/web3.js";
import { BackgroundSolanaConnection, Blockchain } from "@coral-xyz/common";
import { connectionBackgroundClient } from "../client";
import { blockchainSettings } from "../blockchain";

export const anchorContext = selector({
  key: "anchorContext",
  get: ({ get }: any) => {
    const { connectionUrl: _connectionUrl, commitment: _commitment } = get(
      blockchainSettings(Blockchain.SOLANA)
    );

    const _connectionBackgroundClient = get(connectionBackgroundClient);
    const connection = new BackgroundSolanaConnection(
      _connectionBackgroundClient,
      _connectionUrl
    );
    // Note: this provider is *read-only*.
    //
    const dummyWallet = Keypair.generate();
    // @ts-ignore
    const provider = new AnchorProvider(connection, dummyWallet, {
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

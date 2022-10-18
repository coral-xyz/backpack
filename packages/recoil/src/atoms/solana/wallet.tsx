import { selector } from "recoil";
import { AnchorProvider, Spl } from "@project-serum/anchor";
import { Keypair } from "@solana/web3.js";
import { BackgroundSolanaConnection } from "@coral-xyz/common";
import { connectionBackgroundClient } from "../client";
import { solanaCommitment, solanaConnectionUrl } from "./preferences";

export const anchorContext = selector({
  key: "anchorContext",
  // TODO(peterpme): any-> connection /connectionUrl, provider, tokenClient
  get: ({ get }: any) => {
    const _connectionUrl = get(solanaConnectionUrl);
    const _connectionBackgroundClient = get(connectionBackgroundClient);
    const connection = new BackgroundSolanaConnection(
      _connectionBackgroundClient,
      _connectionUrl
    );
    const _commitment = get(solanaCommitment);
    //
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

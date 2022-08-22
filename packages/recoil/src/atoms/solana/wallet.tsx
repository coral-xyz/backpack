import { selector } from "recoil";
import { Provider, Spl } from "@project-serum/anchor";
import { BackgroundSolanaConnection } from "@coral-xyz/common";
import { connectionBackgroundClient } from "../client";
import { solanaCommitment, solanaConnectionUrl } from "./preferences";

export const anchorContext = selector({
  key: "anchorContext",
  get: ({ get }: any) => {
    const _connectionUrl = get(solanaConnectionUrl);
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

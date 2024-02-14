import { AnchorProvider } from "@coral-xyz/anchor";
import { TokenInterface } from "@coral-xyz/secure-clients/legacyCommon";
import { Keypair } from "@solana/web3.js";
import { selector } from "recoil";

import { solanaClientAtom } from "../secure-client";

export const anchorContext = selector({
  key: "anchorContext",
  get: ({ get }) => {
    const solanaClient = get(solanaClientAtom);
    const connection = solanaClient.connection;
    const commitment = solanaClient.connection.commitment;
    const connectionUrl = solanaClient.connection.rpcEndpoint;

    //
    // Note: this provider is *read-only*.
    //
    const dummyWallet = Keypair.generate();
    // @ts-ignore
    const provider = new AnchorProvider(connection, dummyWallet, {
      skipPreflight: false,
      commitment,
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
  dangerouslyAllowMutability: true,
});

import { XNFT_PROGRAM_ID } from "@coral-xyz/common";
import { Program } from "@project-serum/anchor";
import { AnchorProvider } from "@project-serum/anchor/dist/cjs/provider";
import type { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";

import getXnftProgramId from "./getXnftProgramId";
import type { Xnft } from "./xnftIDL";
import { IDL } from "./xnftIDL";

type Wallet = {
  publicKey: PublicKey;
  signTransaction: <T>(t: T) => Promise<T>;
  signAllTransactions: <T>(t: T) => Promise<T>;
};

export default function getProgram(
  connection: Connection,
  wallet?: Wallet
): Program<Xnft> {
  return new Program(
    IDL,
    getXnftProgramId(),
    new AnchorProvider(
      connection,
      wallet ?? {
        publicKey: PublicKey.default,
        signTransaction: async (t) => t,
        signAllTransactions: async (t) => t,
      },
      { commitment: "confirmed", skipPreflight: true }
    )
  );
}

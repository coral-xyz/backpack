import { PublicKey } from "@metaplex-foundation/js";
import { Program } from "@project-serum/anchor";
import { Connection } from "@solana/web3.js";
import { AnchorProvider } from "@project-serum/anchor/dist/cjs/provider";
import { XNFT_PROGRAM_ID } from "packages/common/src";
import { Xnft, IDL } from "./xnftIDL";

export default function getProgram(connection: Connection): Program<Xnft> {
  return new Program(
    IDL,
    XNFT_PROGRAM_ID,
    new AnchorProvider(
      connection,
      {
        publicKey: PublicKey.default,
        signTransaction: async (t) => t,
        signAllTransactions: async (t) => t,
      },
      { commitment: "confirmed", skipPreflight: true }
    )
  );
}

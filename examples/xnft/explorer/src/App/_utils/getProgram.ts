import { PublicKey } from "@metaplex-foundation/js";
import { Program } from "@project-serum/anchor";
import { Connection } from "@solana/web3.js";
import { AnchorProvider } from "@project-serum/anchor/dist/cjs/provider";
import { XNFT_PROGRAM_ID } from "packages/common/src";
import { Xnft, IDL } from "./xnftIDL";

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
    XNFT_PROGRAM_ID,
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

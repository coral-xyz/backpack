import { Metaplex, toMetadataAccount } from "@metaplex-foundation/js";
import {
  MetadataProgram,
  Metadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  AnchorProvider,
  BN,
  Program,
  type ProgramAccount,
  type IdlAccounts,
  type IdlTypes,
} from "@project-serum/anchor";
// import { getAssociatedTokenAddress } from '@solana/spl-token';
import { Connection, PublicKey } from "@solana/web3.js";
import IDL, { type Xnft } from "./xnftIDL";
import CustomJsonMetadata from "../_types/CustomJsonMetadata";
import { XnftWithMetadata } from "../_types/XnftWithMetadata";
import XnftAccount from "../_types/XnftAccount";
import getGatewayUri from "./getGatewayUri";

const XNFT_PROGRAM_ID = new PublicKey(
  "BaHSGaf883GA3u8qSC5wNigcXyaScJLSBJZbALWvPcjs"
);

export default async function getAllxNFTs(
  connection: Connection
): Promise<XnftWithMetadata[]> {
  const program: Program<Xnft> = new Program(
    IDL,
    XNFT_PROGRAM_ID,
    new AnchorProvider(
      window.xnft.solana.connection,
      {
        publicKey: PublicKey.default,
        signTransaction: async (t) => t,
        signAllTransactions: async (t) => t,
      },
      { commitment: "confirmed", skipPreflight: true }
    )
  );
  const mpl = Metaplex.make(connection);
  const xnfts = await program.account.xnft.all();

  const metadataAccounts = (
    await mpl
      .rpc()
      .getMultipleAccounts(xnfts.map((x) => x.account.masterMetadata))
  ).map((acc) => toMetadataAccount(acc).data);

  const jsonBlobs = await Promise.all(
    metadataAccounts.map(
      (m) =>
        mpl
          .storage()
          .downloadJson(
            getGatewayUri(m.data.uri)
          ) as Promise<CustomJsonMetadata>
    )
  );

  // const tokenAccounts = await Promise.all(
  //   xnfts.map(x => getTokenDataForMint(program.provider.connection, x.account.masterMint))
  // );

  const response: XnftWithMetadata[] = [];

  for (let i = 0; i < xnfts.length; i++) {
    response.push({
      account: xnfts[i].account as unknown as XnftAccount,
      json: jsonBlobs[i],
      metadata: metadataAccounts[i] as unknown as Metadata,
      publicKey: xnfts[i].publicKey,
      // token: tokenAccounts[i]
    });
  }

  return response;
}

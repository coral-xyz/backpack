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
import { Xnft, IDL } from "./xnftIDL";
import CustomJsonMetadata from "../_types/CustomJsonMetadata";
import { XnftWithMetadata } from "../_types/XnftWithMetadata";
import XnftAccount from "../_types/XnftAccount";
import getGatewayUri from "./getGatewayUri";
import getProgram from "./getProgram";
import getInstalledXnfts from "./getInstalledXnfts";

const XNFT_PROGRAM_ID = new PublicKey(
  "BaHSGaf883GA3u8qSC5wNigcXyaScJLSBJZbALWvPcjs"
);

export default async function getAllxNFTs(
  connection: Connection,
  publicKey: PublicKey
): Promise<XnftWithMetadata[]> {
  const program = getProgram(connection);
  const mpl = Metaplex.make(connection);
  const [installedXnfts, xnfts] = await Promise.all([
    getInstalledXnfts(connection, publicKey),
    program.account.xnft.all(),
  ]);

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
      installed: installedXnfts.includes(xnfts[i].publicKey.toString()),
      // token: tokenAccounts[i]
    });
  }

  return response;
}

import { Metaplex, toMetadataAccount } from "@metaplex-foundation/js";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { Connection, PublicKey } from "@solana/web3.js";
import CustomJsonMetadata from "../_types/CustomJsonMetadata";
import { XnftWithMetadata } from "../_types/XnftWithMetadata";
import XnftAccount from "../_types/XnftAccount";
import getGatewayUri from "./getGatewayUri";
import getProgram from "./getProgram";
import getInstalledXnfts from "./getInstalledXnfts";
import {
  AccountLayout,
  TOKEN_PROGRAM_ID,
  // @ts-ignore-next-line
  ACCOUNT_SIZE,
} from "@solana/spl-token";

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

  const tokenAccounts = await Promise.all(
    xnfts.map((x) =>
      getTokenDataForMint(program.provider.connection, x.account.masterMint)
    )
  );

  const response: XnftWithMetadata[] = [];

  for (let i = 0; i < xnfts.length; i++) {
    response.push({
      account: xnfts[i].account as unknown as XnftAccount,
      json: jsonBlobs[i],
      metadata: metadataAccounts[i] as unknown as Metadata,
      publicKey: xnfts[i].publicKey,
      installed: installedXnfts.includes(xnfts[i].publicKey.toString()),
      token: tokenAccounts[i],
    });
  }

  return response;
}

async function getTokenDataForMint(
  connection: Connection,
  masterMint: PublicKey
): Promise<XnftWithMetadata["token"]> {
  const tokenAccs = await connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
    filters: [
      {
        dataSize: ACCOUNT_SIZE,
      },
      {
        memcmp: {
          offset: 0,
          bytes: masterMint.toBase58(),
        },
      },
    ],
  });

  if (tokenAccs.length === 0) {
    throw new Error(
      `no token accounts found for mint ${masterMint.toBase58()}`
    );
  }

  const data = AccountLayout.decode(tokenAccs[0].account.data);

  return {
    owner: data.owner,
    publicKey: tokenAccs[0].pubkey,
  };
}

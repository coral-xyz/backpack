import { xnftClient } from "../v1/xnft";
import { Connection, Keypair } from "@solana/web3.js";
import { AnchorProvider } from "@project-serum/anchor";

export async function isXnftOwner(publicKey: string, xnftId: string) {
  const provider = getProvider();
  const client = xnftClient(provider);
  const xnftAccount = await client.account.xnft.fetch(xnftId);
  const owner = xnftAccount.publisher.toString();

  if (owner === publicKey) {
    return true;
  }
  return false;
}

function getProvider() {
  //
  // Note: this provider is *read-only*.
  //
  const dummyWallet = Keypair.generate();
  const connection = getConnection();
  // @ts-ignore
  const provider = new AnchorProvider(connection, dummyWallet, {
    skipPreflight: false,
    commitment: "confirmed",
  });
  return provider;
}

function getConnection() {
  const connectionUrl = "https://solana-rpc.xnfts.dev";
  const connection = new Connection(connectionUrl);
  return connection;
}

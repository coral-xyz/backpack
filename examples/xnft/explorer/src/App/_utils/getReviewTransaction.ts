import { IdlAccounts, Program, ProgramAccount } from "@project-serum/anchor";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Review } from "../_types/XnftReview";
import { XnftWithMetadata } from "../_types/XnftWithMetadata";
import getGatewayUri from "./getGatewayUri";
import getS3Bucket from "./getS3Bucket";
import getWorkerApi from "./getWorkerAPI";
import getXnftProgramId from "./getXnftProgramId";
import { Xnft } from "./xnftIDL";

type ReviewAccount = IdlAccounts<Xnft>["review"];

export default async function getReviewTransaction(
  program: Program<Xnft>,
  author: PublicKey,
  xnft: XnftWithMetadata,
  comment: string,
  rating: number
): Promise<Transaction> {
  const xnftPubkey = new PublicKey(xnft.publicKey);
  const [install] = await PublicKey.findProgramAddress(
    [Buffer.from("install"), author.toBytes(), xnftPubkey.toBytes()],
    getXnftProgramId()
  );
  const exists =
    (await program.provider.connection.getAccountInfo(install)) !== null;
  if (!exists) {
    throw new Error("Must have an active installation to review an xNFT");
  }
  const uri = await uploadComment(xnftPubkey, author, comment);
  const tx = await program.methods
    .createReview(uri, rating)
    .accounts({
      install,
      xnft: xnftPubkey,
      masterToken: new PublicKey(xnft.token.publicKey),
    })
    .transaction();

  return tx;
}

async function uploadComment(
  xnft: PublicKey,
  author: PublicKey,
  comment: string
): Promise<string> {
  const fileName = `${xnft.toBase58()}/comments/${author.toBase58()}/comment.json`;
  const body = JSON.stringify({
    name: fileName,
    content: JSON.stringify({ comment }),
    type: "application/json",
  });

  const resp = await fetch(`${getWorkerApi()}/api/storage/s3`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });
  const json = await resp.json();

  if (resp.status !== 201) {
    throw new Error(JSON.stringify(json));
  }

  return `${getS3Bucket()}/${json.key}`;
}

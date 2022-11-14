// import { IdlAccounts, ProgramAccount } from "@project-serum/anchor";
// import { Connection, PublicKey } from "@solana/web3.js";
// import { Review } from "../_types/XnftReview";
// import { XnftWithMetadata } from "../_types/XnftWithMetadata";
// import getGatewayUri from "./getGatewayUri";
// import getProgram from "./getProgram";
// import getWorkerApi from "./getWorkerAPI";
// import { Xnft } from "./xnftIDL";

// type ReviewAccount = IdlAccounts<Xnft>["review"];

// export default async function getInstalledXnfts(
//   connection: Connection,
//   pubkey: PublicKey
// ): Promise<Review> {

//   return null;
// }

// async function uploadComment(author: PublicKey, comment: string): Promise<string> {
//   const fileName = this.getCommentPath(author);
//   const body = JSON.stringify({
//     name: fileName,
//     content: JSON.stringify({ comment }),
//     type: 'application/json'
//   });

//   const resp = await fetch(
//     `${process.env.NEXT_PUBLIC_WORKER_API_URL}/api/storage/s3`,
//     {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body
//     },
//     20000
//   );

//   if (resp.status !== 201) {
//     const json = await resp.json();
//     throw new Error(JSON.stringify(json));
//   }

//   return `${S3_BUCKET_URL}/${name}`;
// }

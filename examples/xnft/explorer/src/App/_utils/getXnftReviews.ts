import { IdlAccounts, ProgramAccount } from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { Review } from "../_types/XnftReview";
import { XnftWithMetadata } from "../_types/XnftWithMetadata";
import getGatewayUri from "./getGatewayUri";
import getProgram from "./getProgram";
import getWorkerApi from "./getWorkerAPI";
import { Xnft } from "./xnftIDL";

type ReviewAccount = IdlAccounts<Xnft>["review"];

export default async function getXnftReviews(
  connection: Connection,
  pubkey: PublicKey
): Promise<Review[]> {
  const program = getProgram(connection);
  const response: ProgramAccount<ReviewAccount>[] =
    await program.account.review.all([
      {
        memcmp: {
          offset: 8 + 32,
          bytes: pubkey.toBase58(),
        },
      },
    ]);

  const fetchComments = Promise.all(
    response.map(
      (item) =>
        item.account.uri &&
        fetch(getGatewayUri(item.account.uri), {
          headers: { Accept: "application/json" },
        })
          .then((resp) => resp.json())
          .then((json) => json.comment as string)
    )
  );

  const pubkeys = response.map((item) => item?.account?.author?.toString());
  const fetchUsernames = fetch(
    `${getWorkerApi()}/api/identity/usernames?pubkeys=${pubkeys.join(",")}`,
    {
      headers: { Accept: "application/json" },
    }
  )
    .then((resp) => resp.json())
    .then((json) => json.users)
    .catch(() => []);

  const [comments, usernames] = await Promise.all([
    fetchComments,
    fetchUsernames,
  ]);

  return response.map((item, i) => {
    return {
      rating: item.account.rating,
      comment: comments[i],
      author:
        usernames.find((username) =>
          item.account.author.equals(new PublicKey(username.pubkey))
        )?.username ?? item.account.author.toString(),
    };
  });
}

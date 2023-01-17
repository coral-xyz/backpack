BEGIN TRANSACTION;
ALTER TABLE "auth"."mad_feed_votes" DROP CONSTRAINT "mad_feed_votes_pkey";

ALTER TABLE "auth"."mad_feed_votes"
    ADD CONSTRAINT "mad_feed_votes_pkey" PRIMARY KEY ("post_id", "user_id");
COMMIT TRANSACTION;

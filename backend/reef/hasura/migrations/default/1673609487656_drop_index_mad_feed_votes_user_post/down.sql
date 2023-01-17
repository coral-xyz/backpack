CREATE  INDEX "mad_feed_votes_user_post" on
  "auth"."mad_feed_votes" using btree ("post_id", "user_id");

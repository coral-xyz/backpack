CREATE  INDEX "twitter_users_twitter_id_key" on
  "auth"."twitter_users" using btree ("twitter_id");

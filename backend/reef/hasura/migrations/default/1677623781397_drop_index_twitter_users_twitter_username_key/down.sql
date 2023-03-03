CREATE  INDEX "twitter_users_twitter_username_key" on
  "auth"."twitter_users" using btree ("twitter_username");

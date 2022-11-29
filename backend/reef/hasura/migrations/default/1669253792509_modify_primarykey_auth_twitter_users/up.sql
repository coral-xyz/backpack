BEGIN TRANSACTION;
ALTER TABLE "auth"."twitter_users" DROP CONSTRAINT "twitter_users_pkey";

ALTER TABLE "auth"."twitter_users"
    ADD CONSTRAINT "twitter_users_pkey" PRIMARY KEY ("twitter_username", "backpack_username", "twitter_id");
COMMIT TRANSACTION;

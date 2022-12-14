BEGIN TRANSACTION;
ALTER TABLE "auth"."friendships" DROP CONSTRAINT "friendships_pkey";

ALTER TABLE "auth"."friendships"
    ADD CONSTRAINT "friendships_pkey" PRIMARY KEY ("user1", "user2");
COMMIT TRANSACTION;

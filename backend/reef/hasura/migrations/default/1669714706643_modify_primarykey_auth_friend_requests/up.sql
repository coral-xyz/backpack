BEGIN TRANSACTION;
ALTER TABLE "auth"."friend_requests" DROP CONSTRAINT "friend_requests_pkey";

ALTER TABLE "auth"."friend_requests"
    ADD CONSTRAINT "friend_requests_pkey" PRIMARY KEY ("from", "to");
COMMIT TRANSACTION;

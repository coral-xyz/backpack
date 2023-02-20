BEGIN TRANSACTION;
ALTER TABLE "public"."chat_barter_metadata" DROP CONSTRAINT "chat_barter_metadata_pkey";

ALTER TABLE "public"."chat_barter_metadata"
    ADD CONSTRAINT "chat_barter_metadata_pkey" PRIMARY KEY ("id");
COMMIT TRANSACTION;

BEGIN TRANSACTION;
ALTER TABLE "auth"."user_nfts" DROP CONSTRAINT "user_nfts_pkey";

ALTER TABLE "auth"."user_nfts"
    ADD CONSTRAINT "user_nfts_pkey" PRIMARY KEY ("public_key", "nft_id");
COMMIT TRANSACTION;

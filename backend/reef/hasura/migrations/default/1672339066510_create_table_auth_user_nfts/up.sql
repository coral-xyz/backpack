CREATE TABLE "auth"."user_nfts" ("nft_id" text NOT NULL, "public_key" text NOT NULL, "collection_id" text, PRIMARY KEY ("public_key","nft_id") );

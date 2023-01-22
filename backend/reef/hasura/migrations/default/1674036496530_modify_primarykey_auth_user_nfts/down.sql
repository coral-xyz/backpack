alter table "auth"."user_nfts" drop constraint "user_nfts_pkey";
alter table "auth"."user_nfts"
    add constraint "user_nfts_pkey"
    primary key ("public_key", "nft_id");

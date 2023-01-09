alter table "auth"."user_nfts"
  add constraint "user_nfts_blockchain_public_key_fkey"
  foreign key ("blockchain", "public_key")
  references "auth"."public_keys"
  ("blockchain", "public_key") on update no action on delete no action;

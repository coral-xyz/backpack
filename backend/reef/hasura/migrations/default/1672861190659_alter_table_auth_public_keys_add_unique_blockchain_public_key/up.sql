alter table "auth"."public_keys" add constraint "public_keys_blockchain_public_key_key" unique ("blockchain", "public_key");

CREATE  INDEX "public_keys_user_id_idx" on
  "auth"."public_keys" using btree ("user_id");

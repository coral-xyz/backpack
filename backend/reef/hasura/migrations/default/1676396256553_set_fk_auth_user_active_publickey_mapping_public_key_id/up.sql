alter table "auth"."user_active_publickey_mapping"
  add constraint "user_active_publickey_mapping_public_key_id_fkey"
  foreign key ("public_key_id")
  references "auth"."public_keys"
  ("id") on update restrict on delete restrict;

alter table "auth"."user_active_publickey_mapping"
  add constraint "user_active_publickey_mapping_user_id_fkey"
  foreign key ("user_id")
  references "auth"."users"
  ("id") on update restrict on delete restrict;

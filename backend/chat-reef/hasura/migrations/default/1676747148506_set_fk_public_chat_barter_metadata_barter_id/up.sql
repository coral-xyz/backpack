alter table "public"."chat_barter_metadata"
  add constraint "chat_barter_metadata_barter_id_fkey"
  foreign key ("barter_id")
  references "public"."barters"
  ("id") on update restrict on delete restrict;

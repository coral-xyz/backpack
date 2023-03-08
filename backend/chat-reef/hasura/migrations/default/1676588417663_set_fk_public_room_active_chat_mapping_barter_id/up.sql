alter table "public"."room_active_chat_mapping"
  add constraint "room_active_chat_mapping_barter_id_fkey"
  foreign key ("barter_id")
  references "public"."barters"
  ("id") on update restrict on delete restrict;

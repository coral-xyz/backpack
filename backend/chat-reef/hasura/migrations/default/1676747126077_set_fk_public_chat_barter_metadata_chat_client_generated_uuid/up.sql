alter table "public"."chat_barter_metadata"
  add constraint "chat_barter_metadata_chat_client_generated_uuid_fkey"
  foreign key ("chat_client_generated_uuid")
  references "public"."chats"
  ("client_generated_uuid") on update restrict on delete restrict;

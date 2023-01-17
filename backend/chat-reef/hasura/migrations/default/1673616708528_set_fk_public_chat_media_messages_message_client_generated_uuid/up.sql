alter table "public"."chat_media_messages"
  add constraint "chat_media_messages_message_client_generated_uuid_fkey"
  foreign key ("message_client_generated_uuid")
  references "public"."chats"
  ("client_generated_uuid") on update restrict on delete restrict;

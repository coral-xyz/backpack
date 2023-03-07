alter table "public"."nft_sticker_metadata"
  add constraint "nft_sticker_metadata_chat_client_generated_uuid_fkey"
  foreign key ("chat_client_generated_uuid")
  references "public"."chats"
  ("client_generated_uuid") on update restrict on delete restrict;

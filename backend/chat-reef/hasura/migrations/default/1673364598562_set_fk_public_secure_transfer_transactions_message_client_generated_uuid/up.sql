alter table "public"."secure_transfer_transactions"
  add constraint "secure_transfer_transactions_message_client_generated_uuid_f"
  foreign key ("message_client_generated_uuid")
  references "public"."chats"
  ("client_generated_uuid") on update restrict on delete restrict;

alter table "public"."secure_transfer_transactions"
  add constraint "secure_transfer_transactions_message_id_fkey"
  foreign key ("message_id")
  references "public"."chats"
  ("id") on update restrict on delete restrict;

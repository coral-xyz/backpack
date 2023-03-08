alter table "public"."simple_transactions"
  add constraint "simple_transactions_client_generated_uuid_fkey"
  foreign key ("client_generated_uuid")
  references "public"."chats"
  ("client_generated_uuid") on update no action on delete no action;

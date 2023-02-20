alter table "public"."chat_barter_metadata" drop constraint "chat_barter_metadata_pkey";
alter table "public"."chat_barter_metadata"
    add constraint "chat_barter_metadata_pkey"
    primary key ("chat_client_generated_uuid");

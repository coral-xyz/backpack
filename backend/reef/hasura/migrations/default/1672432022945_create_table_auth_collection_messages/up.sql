CREATE TABLE "auth"."collection_messages" ("uuid" text NOT NULL, "last_read_message_id" text NOT NULL, "collection_id" text NOT NULL, PRIMARY KEY ("uuid","collection_id") );

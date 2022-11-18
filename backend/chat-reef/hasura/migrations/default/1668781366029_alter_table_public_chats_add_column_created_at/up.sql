alter table "public"."chats" add column "created_at" timestamptz
 null default now();

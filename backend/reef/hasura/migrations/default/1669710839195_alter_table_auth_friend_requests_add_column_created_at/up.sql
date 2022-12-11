alter table "auth"."friend_requests" add column "created_at" timestamptz
 null default now();

alter table "auth"."twitter_users" add column "twitter_id" citext
 not null unique;

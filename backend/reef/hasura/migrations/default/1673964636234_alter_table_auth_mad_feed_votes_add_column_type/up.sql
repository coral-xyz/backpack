alter table "auth"."mad_feed_votes" add column "type" text
 not null default 'VOTE';

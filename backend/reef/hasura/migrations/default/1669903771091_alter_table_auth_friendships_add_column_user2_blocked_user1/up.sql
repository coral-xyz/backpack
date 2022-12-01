alter table "auth"."friendships" add column "user2_blocked_user1" boolean
 not null default 'false';

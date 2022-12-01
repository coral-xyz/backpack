alter table "auth"."friendships" add column "user1_blocked_user2" boolean
 not null default 'false';

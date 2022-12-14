alter table "auth"."friendships" add column "user2_interacted" boolean
 not null default 'false';

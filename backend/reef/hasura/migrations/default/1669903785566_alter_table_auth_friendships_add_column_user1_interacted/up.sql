alter table "auth"."friendships" add column "user1_interacted" boolean
 not null default 'false';

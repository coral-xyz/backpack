create type blockchain AS enum ('ethereum', 'solana');

alter table "auth"."users" add column "blockchain" blockchain not null default 'solana';

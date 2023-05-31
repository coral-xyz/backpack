alter table "dropzone"."distributors" add column "secret" uuid
 not null default gen_random_uuid();

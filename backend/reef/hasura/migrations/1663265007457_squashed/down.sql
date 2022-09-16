
-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table invitations set schema auth;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- CREATE OR REPLACE VIEW "public"."active_users" AS
--  SELECT username,
--     last_active_at
--    FROM auth.users
--   WHERE (last_active_at > (now() - '00:00:30'::interval));

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- DROP VIEW active_users;
-- CREATE OR REPLACE VIEW "public"."active_users" AS
--  SELECT username,
--     last_active_at
--    FROM auth.users
--   WHERE (last_active_at > (now() - '00:00:30'::interval));

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- CREATE OR REPLACE VIEW "public"."active_users" AS
--  SELECT username,
--     last_active_at
--    FROM auth.users
--   WHERE (last_active_at > (now() - '00:00:30'::interval));

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table users set schema auth;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- CREATE OR REPLACE VIEW public."active_invitations" AS
-- SELECT id,
-- CASE
--         WHEN claimer_id IS NULL THEN 0
--         ELSE 1
--     END AS claimed
-- FROM invitations;

CREATE OR REPLACE VIEW public."active_users" AS
SELECT "users".username, "users".last_active_at
FROM "users"
WHERE ("users".last_active_at > (now() - '00:00:30'::interval));

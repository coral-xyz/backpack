
CREATE OR REPLACE VIEW public."active_invitations" AS
SELECT id,
CASE
        WHEN claimer_id IS NULL THEN 0
        ELSE 1
    END AS claimed
FROM invitations;

alter table users set schema auth;

CREATE OR REPLACE VIEW "public"."active_users" AS 
 SELECT username,
    last_active_at
   FROM auth.users
  WHERE (last_active_at > (now() - '00:00:30'::interval));

DROP VIEW active_users;
CREATE OR REPLACE VIEW "public"."active_users" AS 
 SELECT username,
    last_active_at
   FROM auth.users
  WHERE (last_active_at > (now() - '00:00:30'::interval));

CREATE OR REPLACE VIEW "public"."active_users" AS 
 SELECT username,
    last_active_at
   FROM auth.users
  WHERE (last_active_at > (now() - '00:00:30'::interval));

alter table invitations set schema auth;

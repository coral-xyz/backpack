DROP VIEW active_users;
CREATE OR REPLACE VIEW "public"."active_users" AS 
 SELECT username,
    last_active_at
   FROM auth.users
  WHERE (last_active_at > (now() - '00:00:30'::interval));

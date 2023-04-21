CREATE OR REPLACE FUNCTION auth.users_whose_username_matches(prefix TEXT)
RETURNS SETOF auth.users AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM auth.users
  WHERE username LIKE prefix || '%'
  ORDER BY (username = prefix) DESC, username ASC;
END;
$$ LANGUAGE plpgsql STABLE;
comment on function "auth"."users_whose_username_matches" is E'gets users whose username matches the supplied prefix, returning any exact match as the first result';

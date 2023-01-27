CREATE FUNCTION dropzone.user_dropzone_public_key(user_row auth.users)
RETURNS auth.public_keys AS $$
  SELECT *
  FROM auth.public_keys
  WHERE auth.public_keys.user_id = user_row.id
  AND auth.public_keys.blockchain = 'solana'
  LIMIT 1
$$ LANGUAGE sql STABLE;

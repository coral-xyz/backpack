CREATE OR REPLACE FUNCTION auth.public_key_is_primary(public_key_row auth.public_keys)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.user_active_publickey_mapping AS mapping
    WHERE mapping.blockchain = public_key_row.blockchain
    AND mapping.user_id = public_key_row.user_id
    AND mapping.public_key_id = public_key_row.id
  )
$$ LANGUAGE sql STABLE;

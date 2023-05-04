CREATE VIEW auth.users_with_primary_keys AS
SELECT 
    u.*,
    p.id AS public_key_id,
    p.public_key AS public_key,
    p.blockchain AS public_key_blockchain,
    p.created_at AS public_key_created_at
FROM auth.users u
JOIN auth.user_active_publickey_mapping m ON u.id = m.user_id
JOIN auth.public_keys p ON m.public_key_id = p.id;

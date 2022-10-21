INSERT into "auth.publickeys" (user_id, publickey, blockchain) SELECT (id, pubkey, blockchain) FROM "auth.users";

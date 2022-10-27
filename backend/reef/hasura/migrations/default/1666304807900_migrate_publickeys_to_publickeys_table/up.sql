INSERT into "auth"."publickeys_history" (user_id, publickey, blockchain) SELECT id, pubkey, blockchain FROM "auth"."users";

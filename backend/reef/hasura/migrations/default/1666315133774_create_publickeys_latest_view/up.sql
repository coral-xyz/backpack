create view "auth"."publickeys_latest" as 
select distinct on (user_id, blockchain) user_id, blockchain, publickey
from "auth"."publickeys"
order by user_id, blockchain, created_at desc;

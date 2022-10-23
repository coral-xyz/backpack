create view "auth"."publickeys" as
select distinct on (user_id, blockchain) user_id, blockchain, publickey
from "auth"."publickeys_history"
order by user_id, blockchain, created_at desc;

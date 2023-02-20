CREATE OR REPLACE VIEW "public"."mad_feed_user_vote_sums" AS 
SELECT user_id,
COALESCE(sum(votes), (0)::numeric) AS total,
COALESCE(sum(votes_count), (0)::numeric) AS total_count
FROM mad_feed_post_vote_sums
GROUP BY user_id;

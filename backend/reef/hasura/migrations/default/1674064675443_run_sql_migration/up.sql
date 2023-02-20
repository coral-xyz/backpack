CREATE OR REPLACE VIEW "public"."mad_feed_user_vote_sums" AS 
 SELECT mad_feed_post_vote_sums.user_id,
    COALESCE(sum(mad_feed_post_vote_sums.total), (0)::numeric) AS total,
    COALESCE(sum(mad_feed_post_vote_sums.total_count), (0)::numeric) AS total_count
   FROM mad_feed_post_vote_sums
  GROUP BY mad_feed_post_vote_sums.user_id;

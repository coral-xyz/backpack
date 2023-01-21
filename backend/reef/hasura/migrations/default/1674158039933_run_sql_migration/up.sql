CREATE OR REPLACE VIEW "public"."mad_feed_user_promo_post_sums" AS 
 SELECT mad_feed_votes.user_id,
    COALESCE(sum(mad_feed_post_vote_sums.votes), (0)::numeric) AS promoted_votes,
    COALESCE(sum(mad_feed_votes.value), (0)::numeric) AS promoted_values,
    COALESCE(sum(mad_feed_votes.value+mad_feed_post_vote_sums.votes), (0)::numeric) AS promoted_total
   FROM (auth.mad_feed_votes
     LEFT JOIN mad_feed_post_vote_sums ON ((mad_feed_votes.post_id = mad_feed_post_vote_sums.post_id)))
  WHERE (mad_feed_votes.type = 'PROMOTED'::text)
  GROUP BY mad_feed_votes.user_id, mad_feed_votes.type;

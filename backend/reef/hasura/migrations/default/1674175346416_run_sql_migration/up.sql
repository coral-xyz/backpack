CREATE OR REPLACE VIEW "public"."mad_feed_user_promo_results" AS 
 SELECT mad_feed_votes.user_id,
    COALESCE(sum(mad_feed_votes.value), (0)::numeric) AS total_promotion_results
   FROM auth.mad_feed_votes
  WHERE (mad_feed_votes.type = 'PROMOTION_RESULT'::text)
  GROUP BY mad_feed_votes.user_id;

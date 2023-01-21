CREATE OR REPLACE VIEW "public"."mad_feed_user_score_totals" AS 
 SELECT users.id AS user_id,
    rank() OVER (ORDER BY (COALESCE(sum(mad_feed_post_vote_sums.promotion_results), (0)::numeric)+COALESCE(mad_feed_user_promo_post_sums.promoted_total, (0)::numeric) + COALESCE(sum(mad_feed_post_vote_sums.votes), (0)::numeric)) DESC) AS rank,
    (COALESCE(sum(mad_feed_post_vote_sums.promotion_results), (0)::numeric)+ COALESCE(mad_feed_user_promo_post_sums.promoted_total, (0)::numeric) + COALESCE(sum(mad_feed_post_vote_sums.votes), (0)::numeric)) AS total_score,
    COALESCE(sum(mad_feed_post_vote_sums.votes), (0)::numeric) AS total_post_votes_score,
    COALESCE(mad_feed_user_promo_post_sums.promoted_total, (0)::numeric) AS total_promoted_score,
    COALESCE(sum(mad_feed_post_vote_sums.promotion_results), (0)::numeric) AS total_promotion_results_score
   FROM ((auth.users
     LEFT JOIN mad_feed_post_vote_sums ON ((users.id = mad_feed_post_vote_sums.user_id)))
     LEFT JOIN mad_feed_user_promo_post_sums ON ((users.id = mad_feed_user_promo_post_sums.user_id)))
  GROUP BY users.id, mad_feed_user_promo_post_sums.promoted_total;

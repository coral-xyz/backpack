CREATE OR REPLACE VIEW "public"."mad_feed_user_promoted_post_sums" AS 
 SELECT auth.mad_feed_votes.user_id,
    COALESCE(sum(public.mad_feed_post_vote_sums.votes), 0 ) AS promoted_votes
   FROM (
        auth.mad_feed_votes
        LEFT JOIN public.mad_feed_post_vote_sums ON (
          (auth.mad_feed_votes.post_id = public.mad_feed_post_vote_sums.post_id)
        )
      )
    WHERE (
            (auth.mad_feed_votes.type = 'PROMOTED' :: text)
        )
    GROUP BY auth.mad_feed_votes.user_id, auth.mad_feed_votes.type;

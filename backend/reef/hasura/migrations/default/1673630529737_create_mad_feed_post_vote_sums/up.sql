CREATE OR REPLACE VIEW "public"."mad_feed_post_vote_sums" AS 
SELECT 
    auth.mad_feed_posts.post_id, 
    COALESCE(SUM(auth.mad_feed_votes.value), 0) as total
FROM auth.mad_feed_posts
LEFT OUTER JOIN auth.mad_feed_votes ON auth.mad_feed_posts.post_id=auth.mad_feed_votes.post_id
GROUP BY auth.mad_feed_posts.post_id;

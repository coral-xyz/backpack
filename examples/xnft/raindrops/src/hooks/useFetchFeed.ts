import React, { useEffect } from "react";
import { FeedItem, Feed } from "../mock-data/feed";

const fetchFeed = async (callback: (feed: FeedItem[]) => void) => {
  callback(Feed);
};

export default () => {
  const [feed, setFeed] = React.useState<FeedItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  useEffect(() => {
    setLoading(true);
    fetchFeed((feed) => {
      setFeed(feed);
      setLoading(false);
    });
  });
  return { loading, feed };
};

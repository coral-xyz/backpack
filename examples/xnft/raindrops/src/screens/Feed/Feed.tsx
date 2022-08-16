import { View } from "react-xnft";
import LoadingIndicator from "../../components/LoadingIndicator";
import useFetchFeed from "../../hooks/useFetchFeed";
import FeedItemComponent from "./FeedItem";
import { FeedItem } from "../../mock-data/feed";

export function Feed() {
  const { loading, feed } = useFetchFeed();

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <View
      style={{
        display: "flex",
        // flexWrap: "wrap",
        flexDirection: "column",
        height: "100%",
        // alignItems: "center",
        // justifyContent: "space-evenly",
      }}
    >
      {feed.map((feedItem: FeedItem) => (
        <View
          key={feedItem.id.toString()}
          style={{
            margin: "10px",
            height: "200px",
          }}
        >
          <FeedItemComponent feedItem={feedItem} />
        </View>
      ))}
    </View>
  );
}

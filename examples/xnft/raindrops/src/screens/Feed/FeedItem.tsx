import { View, Text, Image } from "react-xnft";
import { FeedItem } from "../../mock-data/feed";

export default (props: { feedItem: FeedItem }) => {
  return (
    <View
      style={{
        height: "120px",
        width: "100%",
        borderRadius: "16px",
        border: "2px solid #fff",
      }}
    >
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          columnGap: "16px",
        }}
      >
        <Image
          style={{
            height: "117px",
            width: "120px",
            borderTopLeftRadius: "16px",
            borderBottomLeftRadius: "16px",
          }}
          src={props.feedItem.image}
        />
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "16px",
          }}
        >
          <Text
            style={{
              fontSize: "x-large",
              fontWeight: "900",
            }}
          >
            {props.feedItem.title}
          </Text>
          <Text>{props.feedItem.description}</Text>
        </View>
      </View>
    </View>
  );
};

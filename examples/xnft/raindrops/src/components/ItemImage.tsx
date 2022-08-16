import { View, Image, Text } from "react-xnft";
import useFetchNftMetadata from "../hooks/useFetchNftMetadata";
import LoadingIndicator from "./LoadingIndicator";
import { State } from "@raindrops-protocol/raindrops";
import NftImage from "./NftImage";

export default (props: { item: State.Item.Item; style?: {} }) => {
  console.log("#########################ItemImage", props.item);
  const { loading, metadata } = useFetchNftMetadata(props.item.metadata);

  if (loading) {
    return <LoadingIndicator />;
  }

  if (!metadata) {
    return (
      <View>
        <Text>No Item Metadata found</Text>
      </View>
    );
  }

  return <NftImage metadata={metadata} style={props.style} />;
};

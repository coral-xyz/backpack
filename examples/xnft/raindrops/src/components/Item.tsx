import { View, Image, Text } from "react-xnft";
import useFetchNftMetadata from "../hooks/useFetchNftMetadata";
import LoadingIndicator from "./LoadingIndicator";
import { State } from "@raindrops-protocol/raindrops";
import NftImage from "./NftImage";

export default (props: {
  item: State.Item.Item;
  style?: { view?: any; image?: any; text?: any };
}) => {
  console.log("#########################Item", props.item);
  const { loading, metadata } = useFetchNftMetadata(props.item.metadata);
  console.log("#########################Item metadata", metadata);

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

  let viewStyles,
    imageStyles,
    textStyles = {};
  if (props.style) {
    if (props.style.view) {
      viewStyles = {
        ...props.style.view,
      };
    }

    if (props.style.image) {
      imageStyles = {
        ...props.style.image,
      };
    }

    if (props.style.text) {
      textStyles = {
        ...props.style.text,
      };
    }
  }

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        ...viewStyles,
      }}
    >
      <NftImage metadata={metadata} style={imageStyles} />
      <Text style={textStyles}>{metadata.data.name}</Text>
    </View>
  );
};

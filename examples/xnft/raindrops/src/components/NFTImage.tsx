import { View, Image, Text } from "react-xnft";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import useFetchNftImage from "../hooks/useFetchNftImage";
import LoadingIndicator from "./LoadingIndicator";

export default (props: { metadata: Metadata; style?: {} }) => {
  const { loading, imageUrl } = useFetchNftImage(props.metadata);

  if (loading) {
    return <LoadingIndicator />;
  }

  if (!imageUrl) {
    return (
      <View>
        <Text>No Image found</Text>
      </View>
    );
  }

  return (
    <View>
      <Image
        style={{
          borderRadius: "16px",
          height: "200px",
          width: "200px",
          ...props.style,
        }}
        src={imageUrl}
      />
    </View>
  );
};

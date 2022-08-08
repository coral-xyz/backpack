import { Button, View, Text, useNavigation } from "react-xnft";
import useFetchNftMetadata from "../../hooks/useFetchNftMetadata";
import LoadingIndicator from "../../components/LoadingIndicator";
import NftImage from "../../components/NftImage";
import { RaindropsItem } from "../../utils/raindrops";

export default (props: { item: RaindropsItem }) => {
  const nav = useNavigation();

  const clickItem = (item: RaindropsItem, metadata: any) => {
    item.metadata = metadata;
    nav.push("detail", { item });
  };

  const { loading, metadata } = useFetchNftMetadata(props.item.token.mint);

  console.log("#########################ItemGridItem", metadata);
  if (loading) {
    return <LoadingIndicator />;
  }

  if (!metadata) {
    return (
      <View>
        <Text>No NFT found</Text>
      </View>
    );
  }

  return (
    <Button
      style={{
        height: "200px",
        width: "200px",
        borderRadius: "16px",
        backgroundColor: "transparent",
      }}
      onClick={() => {
        clickItem(props.item, metadata);
      }}
    >
      <NftImage metadata={metadata} />
    </Button>
  );
};

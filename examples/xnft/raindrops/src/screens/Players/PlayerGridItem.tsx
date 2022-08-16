import { Button, View, Text, useNavigation } from "react-xnft";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import LoadingIndicator from "../../components/LoadingIndicator";
import useFetchNftMetadata from "../../hooks/useFetchNftMetadata";
import NftImage from "../../components/NftImage";
import { Player } from "../../mock-data/players";

export default (props: { player: Player }) => {
  const nav = useNavigation();
  const { loading, metadata } = useFetchNftMetadata(props.player.mint);

  const clickItem = (player: Player, metadata: Metadata) => {
    nav.push("detail", { player, metadata });
  };

  console.log("#########################PlayerGridItem", metadata);
  if (loading) {
    return <LoadingIndicator />;
  }

  if (!metadata) {
    return (
      <View>
        <Text>No NFT metadata found</Text>
      </View>
    );
  }

  return (
    <Button
      style={{
        height: "200px",
        width: "200px",
        margin: "10px",
        borderRadius: "16px",
        backgroundColor: "transparent",
      }}
      onClick={() => {
        clickItem(props.player, metadata);
      }}
    >
      <View
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <NftImage metadata={metadata} />
        <Text>{props.player.name}</Text>
      </View>
    </Button>
  );
};

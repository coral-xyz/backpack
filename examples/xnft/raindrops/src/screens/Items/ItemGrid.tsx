import { View, Text } from "react-xnft";
import useFetchWalletTokens from "../../hooks/useFetchWalletTokens";
import useFetchRaindropsItems from "../../hooks/useFetchRaindropsItems";
import { RaindropsItem } from "../../utils/raindrops";
import LoadingIndicator from "../../components/LoadingIndicator";
import ItemGridItem from "./ItemGridItem";

export function ItemGrid() {
  const { loading, tokens } = useFetchWalletTokens();
  const { loading: raindropsLoading, raindropsItems } =
    useFetchRaindropsItems(tokens);

  console.log("loading", loading);
  console.log("raindropsLoading", raindropsLoading);
  // if (loading || raindropsLoading) {
  //   console.log("%%%%%%%%%%%%%%%%%%%%%%%%%loading");
  //   return <LoadingIndicator />;
  // }

  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!", raindropsItems);
  if (raindropsItems.length === 0) {
    console.log("**************************raindropsItems.length === 0");
    return (
      <View>
        <Text>No items found</Text>
      </View>
    );
  }

  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@", "displaying items");
  return (
    <View
      style={{
        display: "flex",
        flexWrap: "wrap",
        spaceBetween: "24px",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {raindropsItems.map((raindropsItem: RaindropsItem, index) => (
        <View
          key={`raindropsItem.token.mint?.toString()${index}`}
          style={{
            margin: "10px",
            height: "200px",
            width: "200px",
          }}
        >
          <ItemGridItem item={raindropsItem} />
        </View>
      ))}
    </View>
  );
}

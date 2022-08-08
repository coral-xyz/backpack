import { useConnection, View, Text } from "react-xnft";
import { useEffect, useState } from "react";
import NftImage from "../../components/NftImage";
// import {
//   ItemProgram
// } from "@raindrops-protocol/raindrops";
import {
  RaindropsItem,
  // getRaindropsItem
  // getItemProgram
} from "../../utils/raindrops";

export function ItemDetail(props: { item: RaindropsItem }) {
  const connection = useConnection();
  // const [itemProgram, setItemProgram] = useState<ItemProgram | null>(null);
  // const config: Program.ProgramConfig = {
  //   asyncSigning: true,
  //   provider: window.xnft.provider,
  //   idl: ItemIdl,
  //   // client: new AnchorProgram(ItemIdl, "itemX1XWs9dK8T2Zca4vEEPfCAhRc7yvYFntPjTTVx6", window.xnft.provider),
  // };

  useEffect(() => {
    if (connection) {
      // const program = new AnchorProgram(ItemIdl, "itemX1XWs9dK8T2Zca4vEEPfCAhRc7yvYFntPjTTVx6", window.xnft.provider);
      // const itemProgram = new ItemProgram();
      // itemProgram.asyncSigning = true;
      // itemProgram.client = new AnchorProgram(ItemIdl, "itemX1XWs9dK8T2Zca4vEEPfCAhRc7yvYFntPjTTVx6", window.xnft.provider);
      // setItemProgram(itemProgram);
      // ItemProgram.getProgramWithConfig(
      //   ItemProgram,
      //   config,
      // ).then(setItemProgram);
    }
  }, [connection]);

  console.log("metadata", props.item.metadata);
  // if (itemProgram) {
  // (async () => {
  //   console.log("Item program fetch item class", await itemProgram.fetchItemClass(mint, new BN(0)));
  // })();
  // }
  return (
    <View
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        justifyContent: "center",
      }}
    >
      <View>
        <Text>{props.item.metadata.data.name}</Text>
        <Text>Raindrops Item Linked</Text>
        <NftImage
          style={{
            marginTop: "20px",
          }}
          metadata={props.item.metadata}
        />
      </View>
    </View>
  );
}

import { useConnection, Button, View, Text } from "react-xnft";
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
  const [imageZoomed, setImageZoomed] = useState(false);
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
  let lastUsage: { uses: number; lastActivated: number } = {
    uses: 0,
    lastActivated: 0,
  };
  if (props.item.item.data.usageStates) {
    const usageState = props.item.item.data.usageStates[0];
    console.log("usageState", usageState);
    lastUsage = {
      uses: usageState.uses,
      lastActivated: usageState.activatedAt ? usageState.activatedAt : 0,
    };
  }

  return (
    <View
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        columnGap: "32px",
      }}
    >
      {/* <Button
        onClick={() => {
          setImageZoomed(!imageZoomed);
        }}
      > */}
      <NftImage
        style={{
          height: imageZoomed ? "100vh" : "200px",
          width: imageZoomed ? "100vw" : "200px",
          borderRadius: "16px",
          backgroundColor: "transparent",
          marginTop: "20px",
        }}
        metadata={props.item.metadata}
      />
      {/* </Button> */}
      <View
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Text
          style={{
            fontSize: "x-large",
            fontWeight: "bold",
          }}
        >
          Tokens Staked
        </Text>
        <Text>{props.item.item.tokensStaked}</Text>
        <Text
          style={{
            fontSize: "x-large",
            fontWeight: "bold",
          }}
        >
          Times Used
        </Text>
        <Text>{lastUsage.uses}</Text>
        <Text
          style={{
            fontSize: "x-large",
            fontWeight: "bold",
          }}
        >
          Time Last Used{" "}
        </Text>
        <Text>{new Date(lastUsage.lastActivated).toISOString()}</Text>
      </View>
    </View>
  );
}

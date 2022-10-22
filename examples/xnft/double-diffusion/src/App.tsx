import React, { useState } from "react";
import ReactXnft, {
  View,
  Svg,
  Image,
  Text,
  Path,
  Button,
  Stack,
  Loading,
  useConnection,
  usePublicKey,
  TextField,
} from "react-xnft";
import { THEME } from "./utils/theme";
import axios from "axios";
import { MonitorIcon } from "./utils/icons";
import { useDiffusionTokens } from "./utils";
import {
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import {EmptyScreen} from './screens/Home/Empty';
import {SomeNFTs} from './screens/Home/SomeNFTs';
import {PromptScreen} from './screens/Home/Prompt';
import {CreateScreen} from './screens/Create/Create';
import {PreviewScreen} from './screens/Create/Preview';
import {MintScreen} from './screens/Create/Minted';

//
// On connection to the host environment, warm the cache.
//
ReactXnft.events.on("connect", () => {
  // no-op
});

export function App() {
  const connection = useConnection();
  const identity = usePublicKey();

  const tokenAccounts = useDiffusionTokens()!;
  let screen = "empty"


  if (tokenAccounts === null) {
    return <LoadingIndicatorGrid />;

  }

  if (tokenAccounts.tokens.length > 0) {
    screen = "some"
  }
  console.log(tokenAccounts);

  return (
    <Stack.Navigator
      initialRoute={{ name: screen }}
      options={({ route }) => {
        switch (route.name) {
          case "empty":
            return {
              title: "Double Diffusion",
            };
          case "some":
            return {
              title: "Double Diffusion"
            };
          case "prompt":
            return {
              title: "Prompt Guide"
            };
          case "create":
            return {
              title: "Double Diffusion",
            };
          case "preview":
            return {
              title: "Details"
            };
          case "minted":
            return {
              title: "Mint"
            };
          default:
            throw new Error("unknown route");
        }
      }}
      style={{
        font: "Inter",
        fontSize: "20px",
        fontWeight: "700",
        background: "#181819",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        height: "56px",
      }}
    >
      <Stack.Screen
        name={"empty"}
        component={(props: any) => <EmptyScreen {...props} />}
      />
      <Stack.Screen
        name={"some"}
        component={(props: any) => <SomeNFTs {...props} />}
      />
      <Stack.Screen 
        name={"prompt"}
        component={(props: any) => <PromptScreen {...props}/>}
      />
      <Stack.Screen
        name={"create"}
        component={(props: any) => <CreateScreen {...props} />}
      />
      <Stack.Screen
        name={"preview"}
        component={(props: any) => <PreviewScreen {...props} />}
      />
      <Stack.Screen 
        name={"minted"}
        component={(props: any) => <MintScreen {...props}/>}
      />
    </Stack.Navigator>
  )

}

function LoadingIndicatorGrid() {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <Loading
        style={{ display: "block", marginLeft: "auto", marginRight: "auto" }}
      />
      <Text
        style={{ marginLeft: "auto", marginRight: "auto", marginTop: "10px" }}
      >
        Fetching the NFTs...
      </Text>
      {/* <Text
        style={{ marginLeft: "auto", marginRight: "auto", marginTop: "10px" }}
      >
        ETA 10s
      </Text> */}
    </View>
  );
}
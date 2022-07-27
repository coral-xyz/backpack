import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import AnchorUi, {
  useNavigation,
  Text,
  TextField,
  View,
  Button,
} from "react-xnft";

//
// On connection to the host environment, warm the cache.
//
AnchorUi.events.on("connect", () => {
  //
});

export function App() {
  return <View>Hello world anchor </View>;
}

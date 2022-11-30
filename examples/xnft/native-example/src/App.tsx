import React from "react";
import { Button, View } from "react-native";
import { atom, RecoilRoot, useRecoilState } from "recoil";
import tw from "twrnc";

const testAtom = atom<"native" | "bright">({
  key: "testAtom",
  default: "native",
});

function Root() {
  const [future, setFuture] = useRecoilState(testAtom);
  return (
    <View
      style={tw`h-full ${
        future === "bright" ? "bg-yellow-100" : "bg-blue-100"
      } flex justify-center items-center`}
    >
      <Button
        title={`The Future is ${future}`}
        color={future === "bright" ? "rgb(228, 208, 10)" : "rgb(33, 150, 243)"}
        onPress={() => setFuture(future === "bright" ? "native" : "bright")}
      />
    </View>
  );
}
export default function App() {
  return (
    <RecoilRoot>
      <Root />
    </RecoilRoot>
  );
}

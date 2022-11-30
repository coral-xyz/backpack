import { Button, Image, Text } from "react-native";
import * as Linking from "expo-linking";
import { atom, useRecoilState } from "recoil";

import { Section } from "../components/Section";
import { Screen } from "../components/Screen";

const testAtom = atom<"native" | "bright">({
  key: "testAtom",
  default: "native",
});

function LearnMoreLink({ url }: { url: string }) {
  return <Text onPress={() => Linking.openURL(url)}>Learn more</Text>;
}

export function ExamplesScreens() {
  const [future, setFuture] = useRecoilState(testAtom);

  return (
    <Screen>
      <Section title="Recoil">
        <Button
          title={`The Future is ${future}`}
          color={
            future === "bright" ? "rgb(228, 208, 10)" : "rgb(33, 150, 243)"
          }
          onPress={() => setFuture(future === "bright" ? "native" : "bright")}
        />
      </Section>
      <Section title="Local Image Import">
        <Image
          source={require("../../assets/icon.png")}
          style={{ width: 50, height: 50 }}
        />
        <LearnMoreLink url="https://reactnative.dev/docs/images#static-image-resources" />
      </Section>
      <Section title="Custom Font">
        <Text style={{ fontFamily: "Inter_900Black" }}>
          Inter 900 Black Font
        </Text>
        <LearnMoreLink url="https://docs.expo.dev/guides/using-custom-fonts/#using-a-google-font" />
      </Section>
      <Section title="Opening a URL">
        <Button
          onPress={() => Linking.openURL("https://xnft.gg")}
          title="Open xNFT.gg"
        />
        <LearnMoreLink url="https://docs.expo.dev/versions/latest/sdk/linking/#linkingopenurlurl" />
      </Section>
    </Screen>
  );
}

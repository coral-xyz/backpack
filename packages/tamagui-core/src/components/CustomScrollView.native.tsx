import { PropsWithChildren } from "react";

import { ScrollView } from "react-native-gesture-handler";

export function CustomScrollView(
  props: PropsWithChildren<typeof ScrollView>
): JSX.Element {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        minHeight: "100%",
      }}
      {...props}
    >
      {props.children}
    </ScrollView>
  );
}

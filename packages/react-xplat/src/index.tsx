import React from "react";
import { Text } from "react-native";

export function Hello({ name }: { name: string }): JSX.Element {
  return <Text> Hey {name}!!</Text>;
}

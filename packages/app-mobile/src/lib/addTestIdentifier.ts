import { Platform } from "react-native";

export const addTestIdentifier = (id: string) => {
  const str = toPascalCase(id.replace(/[^a-z0-9 ]/gi, ""));
  return Platform.OS === "android"
    ? { accessibilityLabel: str }
    : { testID: str };
};

const toPascalCase = (str: string) =>
  str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

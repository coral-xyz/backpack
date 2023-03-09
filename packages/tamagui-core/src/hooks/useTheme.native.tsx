import { useColorScheme } from "react-native";

import { darkTheme, lightTheme } from "../theme";

export function useCustomTheme() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  return {
    custom: theme.custom,
    colorScheme,
  };
}

import { useColorScheme } from "react-native";
// @ts-expect-error
import { MOBILE_DARK_THEME, MOBILE_LIGHT_THEME } from "@coral-xyz/themes";

export function useCustomTheme() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? MOBILE_DARK_THEME : MOBILE_LIGHT_THEME;

  return {
    custom: theme.custom,
    colorScheme,
  };
}

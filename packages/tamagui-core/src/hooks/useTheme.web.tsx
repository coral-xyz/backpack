import { useDarkMode } from "@coral-xyz/recoil";
import { MOBILE_DARK_THEME, MOBILE_LIGHT_THEME } from "@coral-xyz/themes";

export function useCustomTheme() {
  const isDarkMode = useDarkMode();
  const theme = isDarkMode ? MOBILE_DARK_THEME : MOBILE_LIGHT_THEME;

  return {
    custom: theme.custom,
    colorScheme: isDarkMode ? "dark" : "light",
  };
}

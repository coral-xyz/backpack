// import { useDarkMode } from "@coral-xyz/recoil";
import { useColorScheme } from "react-native";

import { LIGHT_COLORS, DARK_COLORS } from "@coral-xyz/themes";

export function useTheme() {
  // const isDarkMode = useDarkMode();
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  return {
    custom: theme.custom,
    colorScheme: colorScheme === "dark" ? "dark" : "light",
  };
}

const baseTheme = {
  custom: {
    borderRadius: {
      large: 12,
      medium: 8,
    },
  },
};

export const darkTheme = {
  ...baseTheme,
  custom: {
    colors: LIGHT_COLORS,
  },
};

export const lightTheme = {
  ...baseTheme,
  custom: {
    colors: DARK_COLORS,
  },
};

export type CustomTheme = typeof lightTheme & typeof darkTheme;

import { useColorScheme } from "react-native";

export function useTheme() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  return {
    custom: theme,
    colorScheme,
  };
}

const darkTheme = {
  backgroundColor: "black",
  fontColor: "white",
};

const lightTheme = {
  backgroundColor: "white",
  fontColor: "black",
};

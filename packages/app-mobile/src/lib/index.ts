import { Dimensions, FlatList, StyleSheet } from "react-native";
export function maybeRender(
  condition: boolean,
  fn: () => JSX.Element
): JSX.Element | null {
  if (condition) {
    return fn() as JSX.Element;
  }

  return null;
}

export function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export const WINDOW_WIDTH = Dimensions.get("window").width;

const ITEM_GAP = 16;
const ITEM_SPACE = ITEM_GAP / 2;

export const GlobalStyles = StyleSheet.create({
  listContainer: {
    paddingTop: ITEM_SPACE,
    marginTop: ITEM_SPACE,
    paddingHorizontal: ITEM_GAP,
  },
  listContentContainer: {
    gap: ITEM_GAP,
  },
});

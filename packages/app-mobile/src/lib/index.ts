import { Dimensions } from "react-native";
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

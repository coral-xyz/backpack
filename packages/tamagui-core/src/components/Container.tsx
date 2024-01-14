import { View } from "react-native";

export function Margin({
  bottom,
  top,
  left,
  right,
  horizontal,
  vertical,
  children,
}: {
  bottom?: number | string;
  top?: number | string;
  left?: number | string;
  right?: number | string;
  horizontal?: number | string;
  vertical?: number | string;
  children: any;
}): JSX.Element {
  const style = {};
  if (bottom) {
    // @ts-ignore
    style.marginBottom = bottom;
  }

  if (top) {
    // @ts-ignore
    style.marginTop = top;
  }

  if (left) {
    // @ts-ignore
    style.marginLeft = left;
  }

  if (right) {
    // @ts-ignore
    style.marginRight = right;
  }

  if (horizontal) {
    // @ts-ignore
    style.marginHorizontal = horizontal;
  }

  if (vertical) {
    // @ts-ignore
    style.marginVertical = vertical;
  }

  return <View style={style}>{children}</View>;
}

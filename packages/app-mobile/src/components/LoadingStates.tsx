import { StyleProp, View, ViewStyle } from "react-native";

import ContentLoader, { Rect } from "react-content-loader/native";

import { WINDOW_WIDTH } from "~src/lib";

export function ScreenListLoading({
  numItems = 9,
  style,
}: {
  numItems?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const width = WINDOW_WIDTH - 16;
  const itemHeight = 54;
  const itemSpacing = 8;
  const totalItemHeight = numItems * itemHeight;
  const totalSpacing = (numItems - 1) * itemSpacing;
  const contentHeight = totalItemHeight + totalSpacing;
  const height = contentHeight + 32; // Additional space for top and bottom padding

  return (
    <View style={style}>
      <ContentLoader
        speed={1}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        backgroundColor="#FAFAFA"
        foregroundColor="#EEE"
      >
        {[...Array(numItems)].map((_, index) => (
          <Rect
            key={index} // eslint-disable-line
            x="16"
            y={16 + (itemHeight + itemSpacing) * index}
            rx="8"
            ry="8"
            width={width - 16}
            height={itemHeight}
          />
        ))}
      </ContentLoader>
    </View>
  );
}

export function BalanceSummaryWidgetLoading() {
  const width = 160;
  const height = 72;

  return (
    <View style={{ alignSelf: "center" }}>
      <ContentLoader
        speed={1}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        backgroundColor="#FAFAFA"
        foregroundColor="#EEE"
      >
        <Rect x="0" y="" rx="8" ry="8" width={width} height="48" />
        <Rect x="16" y="56" rx="8" ry="8" width={width - 32} height="16" />
      </ContentLoader>
    </View>
  );
}

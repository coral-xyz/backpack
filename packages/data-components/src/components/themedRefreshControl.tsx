import type { ComponentProps } from "react";
import { type FlatList, Platform, RefreshControl } from "react-native";
import { useTheme } from "@coral-xyz/tamagui";

type RefreshControlProps = Pick<
  ComponentProps<typeof FlatList>,
  "refreshing" | "onRefresh"
>;

/**
 * Returns either an object with a themed refreshControl or no keys,
 * should be spread inside a FlatList, SectionList, ScrollView etc.
 * @usage
 * <FlatList
 *  {...themedRefreshControl({
 *    refreshing: props.refreshing,
 *    onRefresh: props.onRefresh
 *  })} />
 */
export function themedRefreshControl(props: RefreshControlProps) {
  return Platform.select({
    android: {},
    ios:
      typeof props.refreshing === "boolean" && props.onRefresh
        ? {
            refreshControl: <ThemedRefreshControl {...props} />,
          }
        : {},
  });
}

/**
 * A custom refresh spinner that uses the theme's color
 */
function ThemedRefreshControl(props: RefreshControlProps): JSX.Element {
  const theme = useTheme();
  return (
    <RefreshControl
      refreshing={props.refreshing as boolean}
      onRefresh={props.onRefresh!}
      // theme.baseIcon.val is too dark in dark mode
      colors={[theme.baseTextMedEmphasis.val]}
      tintColor={theme.baseTextMedEmphasis.val}
    />
  );
}

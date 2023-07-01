import {
  StyleSheet,
  FlatList,
  FlatListProps,
  View,
  SectionListProps,
  SectionList,
} from "react-native";

import { StyledText } from "@coral-xyz/tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const SCREEN_GAP = 16;
export const ITEM_GAP = 16;
export const ITEM_SPACE = ITEM_GAP / 2;

export function PaddedSectionList({
  style,
  contentContainerStyle,
  ...props
}: SectionListProps<any>) {
  const insets = useSafeAreaInsets();
  return (
    <SectionList
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
      style={[ListStyles.listContainer, style]}
      contentContainerStyle={[
        { paddingBottom: insets.bottom + SCREEN_GAP },
        contentContainerStyle,
      ]}
      {...props}
    />
  );
}

export function PaddedFlatList({
  style,
  contentContainerStyle,
  ...props
}: FlatListProps<any>) {
  const insets = useSafeAreaInsets();
  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      style={[ListStyles.listContainer, style]}
      contentContainerStyle={[
        { paddingBottom: insets.bottom + SCREEN_GAP },
        contentContainerStyle,
      ]}
      {...props}
    />
  );
}

export function ListSpacer() {
  return <View style={{ height: SCREEN_GAP }} />;
}

export function SectionHeader({ title }: { title: string }): JSX.Element {
  return (
    <StyledText ml={SCREEN_GAP} color="$baseTextMedEmphasis" size={16} mb={4}>
      {title}
    </StyledText>
  );
}

export const ListStyles = StyleSheet.create({
  listContainer: {
    paddingTop: ITEM_SPACE,
    marginTop: ITEM_SPACE,
    paddingHorizontal: ITEM_GAP,
  },
  columnGap: {
    gap: ITEM_GAP,
  },
});

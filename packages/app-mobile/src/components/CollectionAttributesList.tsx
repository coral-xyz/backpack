import { Text, View } from "react-native";

import { toTitleCase } from "@coral-xyz/common";
import { StyledText } from "@coral-xyz/tamagui";

import { useTheme } from "~hooks/useTheme";

type Attribute = {
  trait: string;
  value: string;
};

export function CollectionAttributes({
  attributes,
}: {
  attributes: Attribute[];
}): JSX.Element | null {
  const theme = useTheme();
  if (!attributes || attributes?.length === 0) {
    return null;
  }

  return (
    <>
      <StyledText color="$secondary" size="$base">
        Attributes
      </StyledText>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {attributes.map((attr: Attribute) => {
          return (
            <View
              key={attr.trait}
              style={{
                padding: 4,
              }}
            >
              <View
                style={{
                  borderRadius: 8,
                  backgroundColor: theme.custom.colors.nav,
                  paddingTop: 4,
                  paddingBottom: 4,
                  paddingLeft: 8,
                  paddingRight: 8,
                }}
              >
                <Text
                  style={{
                    color: theme.custom.colors.secondary,
                    fontSize: 14,
                  }}
                >
                  {toTitleCase(attr.trait)}
                </Text>
                <Text
                  style={{
                    color: theme.custom.colors.fontColor,
                    fontSize: 16,
                  }}
                >
                  {attr.value}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </>
  );
}

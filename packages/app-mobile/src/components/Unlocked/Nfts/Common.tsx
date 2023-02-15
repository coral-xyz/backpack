import { Pressable, StyleSheet, Text, View } from "react-native";

import { ProxyImage } from "~components/index";
import { useTheme } from "~hooks/useTheme";

export function GridCard({ onPress, nft, subtitle }: any) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <ProxyImage
        style={styles.image}
        src={nft.imageUrl}
        onError={(event: any) => (event.currentTarget.style.display = "none")}
      />
      {subtitle ? (
        <View
          style={[
            { backgroundColor: theme.custom.colors.nav },
            styles.subtitleContainer,
          ]}
        >
          <Text
            style={{
              justifyContent: "space-between",
              fontSize: 12,
              color: theme.custom.colors.fontColor,
            }}
          >
            <Text
              style={{
                // textOverflow: "ellipsis",
                overflow: "hidden",
                // whiteSpace: "nowrap",
              }}
            >
              {subtitle.name}
            </Text>
            <Text
              style={{
                marginLeft: 8,
                color: theme.custom.colors.secondary,
              }}
            >
              {subtitle.length}
            </Text>
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
    borderRadius: 8,
    overflow: "hidden",
    width: 150,
    height: 150,
    aspectRatio: 1,
  },
  image: {
    width: "100%",
  },
  subtitleContainer: {
    position: "absolute",
    left: 0,
    bottom: 8,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 8,
    marginHorizontal: "5%",
    justifyContent: "center",
    maxWidth: "90%",
  },
});

import { ProxyImage } from "@components";
import { useTheme } from "@hooks/useTheme";
import { Pressable, Text, View } from "react-native";

export function NFTCard({ onPress, imageUrl, subtitle }: any) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        padding: 0,
        borderRadius: 8,
        minWidth: 150,
        minHeight: 150,
        aspectRatio: 1,
        position: "relative",
      }}
    >
      <ProxyImage
        style={{
          aspectRatio: 1,
          width: "100%",
        }}
        src={imageUrl}
        onError={(event: any) => (event.currentTarget.style.display = "none")}
      />
      {subtitle ? (
        <View
          style={{
            backgroundColor: theme.custom.colors.nav,
            position: "absolute",
            left: 0,
            bottom: 8,
            zIndex: 2,
            height: 24,
            borderRadius: 12,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{
                justifyContent: "space-between",
                fontSize: 12,
                color: theme.custom.colors.fontColor,
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
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}

import { Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar, Margin } from "@components";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@hooks";

export function NavHeader({
  title,
  navigation,
}: {
  title: string;
  navigation: any;
}) {
  const theme = useTheme();
  const emoji = title.startsWith("Balances")
    ? "💰"
    : title.startsWith("Apps")
    ? "👾"
    : "🎨";

  return (
    <View
      style={[
        { backgroundColor: theme.custom.colors.background },
        styles.container,
      ]}
    >
      <View style={styles.centeredRow}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[{ color: theme.custom.colors.fontColor }, styles.title]}>
          {title}
        </Text>
      </View>
      <View style={styles.centeredRow}>
        <Margin right={12}>
          <Pressable onPress={() => navigation.navigate("RecentActivityModal")}>
            <MaterialIcons
              name="list"
              size={28}
              color={theme.custom.colors.icon}
            />
          </Pressable>
        </Margin>
        <Pressable onPress={() => navigation.navigate("AccountSettingsModal")}>
          <Avatar size={28} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    height: 54,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  centeredRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  emoji: {
    fontSize: 24,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
});

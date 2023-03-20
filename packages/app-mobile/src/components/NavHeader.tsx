import { Pressable, StyleSheet, Text, View } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import { HeaderBackButton, getHeaderTitle } from "@react-navigation/elements";
import { StackHeaderProps } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar, Margin } from "~components/index";
import { useTheme } from "~hooks/useTheme";

export function NavHeader({
  navigation,
  route,
  options,
  back,
}: StackHeaderProps): JSX.Element {
  const title = getHeaderTitle(options, route.name);

  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.custom.colors.background,
          marginTop: insets.top,
          paddingLeft: insets.left + 12,
          paddingRight: insets.right + 12,
        },
        styles.container,
      ]}
    >
      {back ? (
        <HeaderBackButton
          tintColor={theme.custom.colors.fontColor}
          onPress={navigation.goBack}
        />
      ) : null}

      <View style={styles.centeredRow}>
        <Text style={[{ color: theme.custom.colors.fontColor }, styles.title]}>
          {title}
        </Text>
      </View>

      {back ? (
        <View style={{ width: 50, height: 40 }} />
      ) : (
        <View style={styles.centeredRow}>
          <Margin right={12}>
            <Pressable onPress={() => navigation.navigate("RecentActivity")}>
              <MaterialIcons
                name="list"
                size={28}
                color={theme.custom.colors.icon}
              />
            </Pressable>
          </Margin>
          <Pressable onPress={() => navigation.navigate("AccountSettings")}>
            <Avatar size={28} />
          </Pressable>
        </View>
      )}
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
  title: {
    fontSize: 22,
    fontWeight: "600",
  },
});

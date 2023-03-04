import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "~hooks/useTheme";

export function ActionCard({
  icon,
  text,
  textAdornment,
  onPress,
  disabled = false,
}: {
  icon: any;
  text: string;
  textAdornment?: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      disabled={disabled}
      onPress={() => onPress()}
      style={[
        {
          borderWidth: 1,
          backgroundColor: theme.custom.colors.nav,
          borderColor: theme.custom.colors.borderFull,
          opacity: disabled ? 0.5 : 1,
        },
        styles.container,
      ]}
    >
      <View style={styles.iconContainer}>{icon}</View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={[styles.text, { color: theme.custom.colors.fontColor }]}>
          {text}
        </Text>
        {textAdornment}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    minHeight: 100,
  },
  iconContainer: {
    width: 32,
    height: 32,
    marginBottom: 6,
  },
  text: {
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 24,
    marginRight: 4,
  },
});

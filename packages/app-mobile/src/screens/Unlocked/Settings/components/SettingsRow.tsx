import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

import { Margin } from "~components/index";
import { useTheme } from "~hooks/useTheme";

export function IconPushDetail() {
  const theme = useTheme();
  return (
    <MaterialIcons
      name="keyboard-arrow-right"
      size={24}
      color={theme.custom.colors.icon}
    />
  );
}

export function IconExpand({ collapsed = true }: { collapsed: boolean }) {
  const theme = useTheme();
  const name = collapsed ? `keyboard-arrow-down` : `keyboard-arrow-up`;

  return (
    <MaterialIcons name={name} size={24} color={theme.custom.colors.icon} />
  );
}

export function IconLaunchDetail() {
  const theme = useTheme();
  return (
    <MaterialCommunityIcons
      name="arrow-top-right"
      size={24}
      color={theme.custom.colors.icon}
    />
  );
}

export function IconLeft({ name }) {
  const theme = useTheme();
  return (
    <MaterialIcons name={name} color={theme.custom.colors.icon} size={24} />
  );
}

export function IconCopyContent() {
  const theme = useTheme();
  return (
    <MaterialIcons
      name="content-copy"
      color={theme.custom.colors.icon}
      size={24}
    />
  );
}

function RowContainer({ children }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.custom.colors.nav,
        },
      ]}
    >
      {children}
    </View>
  );
}

export function SettingsRowSwitch({
  loading,
  onPress,
  icon,
  label,
  value,
}: {
  loading?: boolean;
  onPress: (value: boolean) => void;
  icon?: JSX.Element;
  label: string;
  value: boolean;
}) {
  const theme = useTheme();
  return (
    <RowContainer>
      <View style={styles.leftSide}>
        {icon ? <Margin right={12}>{icon}</Margin> : null}
        <Text style={[styles.label, { color: theme.custom.colors.fontColor }]}>
          {label}
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={value ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => onPress(value)}
          value={value}
        />
      )}
    </RowContainer>
  );
}

export function SettingsRowText({
  icon,
  label,
  detailText,
}: {
  icon?: JSX.Element;
  label: string;
  detailText: string;
}) {
  const theme = useTheme();
  return (
    <RowContainer>
      <View style={styles.leftSide}>
        {icon ? <Margin right={12}>{icon}</Margin> : null}
        <Text style={[styles.label, { color: theme.custom.colors.fontColor }]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.label, { color: theme.custom.colors.fontColor }]}>
        {detailText}
      </Text>
    </RowContainer>
  );
}

export function SettingsRow({
  disabled = false,
  label,
  onPress,
  icon,
  detailIcon,
}: {
  label: string;
  onPress: () => void;
  icon?: JSX.Element;
  detailIcon?: null | JSX.Element;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable disabled={disabled} onPress={() => onPress()}>
      <RowContainer>
        <View style={styles.leftSide}>
          {icon ? <Margin right={12}>{icon}</Margin> : null}
          <Text
            style={[
              styles.label,
              {
                opacity: disabled ? 0.5 : 1,
                color: theme.custom.colors.fontColor,
              },
            ]}
          >
            {label}
          </Text>
        </View>
        {detailIcon ? detailIcon : null}
      </RowContainer>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSide: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 24,
  },
});

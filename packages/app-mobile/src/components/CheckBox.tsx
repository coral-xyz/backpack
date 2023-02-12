import { StyleSheet, Text, View, Pressable } from "react-native";

import ExpoCheckBox from "expo-checkbox";

import { useTheme } from "@hooks";
import { Controller } from "react-hook-form";

export const BaseCheckBoxLabel: React.FC<{
  label: string;
  value: any;
  onPress: (value: boolean) => void;
}> = ({ label, value, onPress }) => {
  const theme = useTheme();
  return (
    <Pressable
      disabled={!label}
      style={styles.row}
      onPress={() => onPress(!value)}
    >
      <ExpoCheckBox
        value={value}
        onValueChange={label ? () => {} : onPress}
        color={theme.custom.colors.fontColor}
      />
      {label ? (
        <Text
          style={[
            styles.label,
            {
              color: theme.custom.colors.fontColor,
            },
          ]}
        >
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
};

export const CheckBox: React.FC<{
  name: string;
  control: any;
  label: string;
}> = ({ name, control, label }) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <BaseCheckBoxLabel label={label} value={value} onPress={onChange} />
      )}
      rules={{
        required: "You must agree to the Terms of Service",
      }}
    />
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    marginLeft: 8,
  },
});

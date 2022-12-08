import { Controller } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@hooks";
import ExpoCheckBox from "expo-checkbox";

export const BaseCheckBoxLabel: React.FC<{
  label: string;
  value: any;
  onPress: (value: boolean) => void;
}> = ({ label, value, onPress }) => {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <ExpoCheckBox
        value={value}
        onValueChange={onPress}
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
    </View>
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

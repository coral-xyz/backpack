import { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";

import { DangerButton, YStack } from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { AvoidSoftInput } from "react-native-avoid-softinput";

import { HeaderIconSubtitle, Margin } from "~components/index";
import { useTheme } from "~hooks/useTheme";

import { BIOMETRIC_PASSWORD } from "../biometrics";
import {
  useDeviceSupportsBiometricAuth,
  useOsBiometricAuthEnabled,
} from "../biometrics/hooks";

import * as Form from "~src/components/Form";
import { WarningIcon } from "~src/components/Icon";
import { PasswordInput } from "~src/components/StyledTextInput";

export function WarningHeader({
  title = "Warning",
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <HeaderIconSubtitle
      icon={<WarningIcon color="#E95050" />}
      title={title}
      subtitle={subtitle}
    />
  );
}

type Warning = {
  icon: string;
  text: string;
};
export function WarningList({ warnings }: { warnings: Warning[] }) {
  const theme = useTheme();
  return (
    <YStack>
      {warnings.map(({ icon, text }) => {
        return (
          <View
            key={text}
            style={[
              {
                backgroundColor: theme.custom.colors.nav,
                borderColor: theme.custom.colors.borderFull,
              },
              styles.listContainer,
            ]}
          >
            <Margin right={12}>
              <MaterialIcons name={icon} size={24} color="#E95050" />
            </Margin>
            <Text
              style={[
                {
                  color: theme.custom.colors.fontColor,
                },
                styles.listItem,
              ]}
            >
              {text}
            </Text>
          </View>
        );
      })}
    </YStack>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    marginBottom: 12,
    borderWidth: 1,
  },
  listItem: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
});

type FormData = {
  password: string;
};

AvoidSoftInput.setAvoidOffset(88);
AvoidSoftInput.setHideAnimationDelay(100);

export function UnlockPasswordOrBiometrics({
  label,
  onMaybeUnlock,
}: {
  label: string;
  onMaybeUnlock: (data: FormData) => void;
}): JSX.Element {
  const isBiometricsEnabled = useOsBiometricAuthEnabled();
  const { biometricName } = useDeviceSupportsBiometricAuth();
  const { control, handleSubmit, formState, setError } = useForm<FormData>();

  const onFocusEffect = useCallback(() => {
    // This should be run when screen gains focus - enable the module where it's needed
    AvoidSoftInput.setShouldMimicIOSBehavior(true);
    AvoidSoftInput.setEnabled(true);
    return () => {
      // This should be run when screen loses focus - disable the module where it's not needed, to make a cleanup
      AvoidSoftInput.setEnabled(false);
      AvoidSoftInput.setShouldMimicIOSBehavior(false);
    };
  }, []);

  useFocusEffect(onFocusEffect); // register callback to focus events

  const onSubmit = (data: FormData) => {
    try {
      const biometricsOrPassword = isBiometricsEnabled
        ? BIOMETRIC_PASSWORD
        : data.password;

      onMaybeUnlock({ ...data, password: biometricsOrPassword });
    } catch (error) {
      console.error(error);
      setError("password", {
        message: "Incorrect password",
      });
    }
  };

  return (
    <Form.Wrapper>
      {!isBiometricsEnabled ? (
        <Form.Group errorMessage={formState.errors.password?.message}>
          <PasswordInput
            onSubmitEditing={handleSubmit(onSubmit)}
            returnKeyType="done"
            placeholder="Password"
            name="password"
            control={control}
            rules={{
              required: "You must enter a password",
            }}
          />
        </Form.Group>
      ) : null}
      <DangerButton
        disabled={Boolean(!formState.isDirty && !formState.isValid)}
        label={`${label} ${
          isBiometricsEnabled ? `using ${biometricName}` : ""
        }`}
        onPress={handleSubmit(onSubmit)}
      />
    </Form.Wrapper>
  );
}

import { Alert, Text, View } from "react-native";

import {
  UI_RPC_METHOD_KEYRING_STORE_CHECK_PASSWORD,
  UI_RPC_METHOD_PASSWORD_UPDATE,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { useForm } from "react-hook-form";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { InputGroup, InputListItem } from "~components/Form";
import { Margin, PrimaryButton, Screen } from "~components/index";
import { useTheme } from "~hooks/useTheme";

function InstructionText({
  text,
  onPress,
}: {
  text: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Text
      onPress={onPress}
      style={{
        fontWeight: "500",
        fontSize: 14,
        lineHeight: 20,
        color: theme.custom.colors.subtext,
      }}
    >
      {text}
    </Text>
  );
}

type PasswordInput = {
  currentPassword: string;
  newPassword: string;
  verifyPassword: string;
};

export function ChangePasswordScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const background = useBackgroundClient();
  const { control, handleSubmit, formState, watch } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      verifyPassword: "",
    },
  });

  const hasError = (name: string) => !!formState.errors[name];
  const isValid = Object.keys(formState.errors).length === 0;

  const onSubmit = async ({
    currentPassword,
    newPassword,
    verifyPassword,
  }: PasswordInput) => {
    Alert.alert(
      "success",
      JSON.stringify({ currentPassword, newPassword, verifyPassword })
    );

    const isCurrentCorrect = await background.request({
      method: UI_RPC_METHOD_KEYRING_STORE_CHECK_PASSWORD,
      params: [currentPassword],
    });

    const mismatchError =
      newPassword.trim() === "" || newPassword !== verifyPassword;

    if (!isCurrentCorrect || mismatchError) {
      return;
    }

    await background.request({
      method: UI_RPC_METHOD_PASSWORD_UPDATE,
      params: [currentPassword, newPassword],
    });
  };

  const handlePressForgotPassword = () => {
    navigation.navigate("forgot-password");
  };

  return (
    <Screen
      style={{ justifyContent: "space-between", marginBottom: insets.bottom }}
    >
      <View>
        <InputGroup hasError={hasError("currentPassword")}>
          <InputListItem
            title="Current"
            placeholder="Enter password"
            name="currentPassword"
            control={control}
            secureTextEntry
            rules={{
              minLength: 8,
              required: true,
            }}
          />
        </InputGroup>
        <Margin top={12} bottom={36}>
          <InstructionText
            text="Forgot password?"
            onPress={handlePressForgotPassword}
          />
        </Margin>
        <InputGroup
          hasError={hasError("newPassword") || hasError("verifyPassword")}
        >
          <InputListItem
            title="New"
            placeholder="Enter password"
            name="newPassword"
            secureTextEntry
            control={control}
            rules={{
              minLength: 8,
              required: true,
              validate: (val: string) => {
                if (val === watch("currentPassword")) {
                  return "Your passwords are the same";
                }
              },
            }}
          />
          <InputListItem
            title="Verify"
            placeholder="Re-enter password"
            name="verifyPassword"
            secureTextEntry
            control={control}
            rules={{
              required: true,
              minLength: 8,
              validate: (val: string) => {
                if (val !== watch("newPassword")) {
                  return "Passwords do not match";
                }
              },
            }}
          />
        </InputGroup>
        <Margin top={12}>
          <InstructionText text="Your password must be at least 8 characters long and contain letters and numbers." />
        </Margin>
      </View>
      <PrimaryButton
        disabled={!isValid}
        label="Change Password"
        onPress={handleSubmit(onSubmit)}
      />
    </Screen>
  );
}

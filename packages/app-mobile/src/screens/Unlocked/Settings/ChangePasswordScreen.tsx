import { Text, View } from "react-native";

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
  onPress?: () => void;
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
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty, isValid },
    setError,
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      verifyPassword: "",
    },
  });

  const onSubmit = async ({
    currentPassword,
    newPassword,
    verifyPassword,
  }: PasswordInput) => {
    const isCurrentCorrect = await background.request({
      method: UI_RPC_METHOD_KEYRING_STORE_CHECK_PASSWORD,
      params: [currentPassword],
    });

    const mismatchError =
      newPassword.trim() === "" || newPassword !== verifyPassword;

    if (!isCurrentCorrect || mismatchError) {
      return setError("currentPassword", { message: "Incorrect password" });
    }

    await background.request({
      method: UI_RPC_METHOD_PASSWORD_UPDATE,
      params: [currentPassword, newPassword],
    });

    navigation.popToTop();
  };

  const handlePressForgotPassword = () => {
    navigation.navigate("forgot-password");
  };

  return (
    <Screen
      style={{ justifyContent: "space-between", marginBottom: insets.bottom }}
    >
      <View>
        <InputGroup
          hasError={Boolean(errors.currentPassword)}
          errorMessage={errors.currentPassword?.message}
        >
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
          hasError={Boolean(errors.newPassword || errors.verifyPassword)}
          errorMessage={[
            errors.newPassword?.message,
            errors.verifyPassword?.message,
          ]
            .filter(Boolean)
            .join(". ")
            .concat(".")}
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
                  return "Your new password must be different";
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
              validate: (val: string) => {
                if (val !== watch("newPassword")) {
                  return "Password and confirmation do not match";
                }
              },
            }}
          />
        </InputGroup>

        <Margin top={12}>
          <InstructionText text="Your password must be at least 8 characters long." />
        </Margin>
      </View>
      <PrimaryButton
        disabled={Boolean(!isDirty && !isValid)}
        label="Change Password"
        onPress={handleSubmit(onSubmit)}
      />
    </Screen>
  );
}

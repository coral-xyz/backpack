import { Suspense, useEffect, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { UI_RPC_METHOD_KEYRING_STORE_UNLOCK } from "@coral-xyz/common";
import { useBackgroundClient, useUser } from "@coral-xyz/recoil";
import { YStack } from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";
import { useForm } from "react-hook-form";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BottomSheetHelpModal,
  HelpModalMenuButton,
} from "~components/BottomSheetHelpModal";
import { ErrorMessage } from "~components/ErrorMessage";
import { PasswordInput } from "~components/PasswordInput";
import {
  CurrentUserAvatar,
  PrimaryButton,
  LinkButton,
  Screen,
  ScreenError,
  ScreenLoading,
  WelcomeLogoHeader,
} from "~components/index";

import {
  BIOMETRIC_PASSWORD,
  BiometricAuthenticationStatus,
  tryLocalAuthenticate,
} from "~src/features/biometrics";
import {
  useDeviceSupportsBiometricAuth,
  useOsBiometricAuthEnabled,
} from "~src/features/biometrics/hooks";

interface FormData {
  password: string;
}

function Container(): JSX.Element {
  const user = useUser();
  const insets = useSafeAreaInsets();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const isBiometricsEnabled = useOsBiometricAuthEnabled();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Screen
        style={[
          styles.container,
          {
            marginTop: insets.top,
            marginBottom: insets.bottom,
          },
        ]}
      >
        <HelpModalMenuButton
          onPress={() => {
            Keyboard.dismiss();
            setIsModalVisible((last) => !last);
          }}
        />
        <WelcomeLogoHeader subtitle={`gm ${user.username}`} />
        <View>
          {user.username ? (
            <View style={[{ marginBottom: -40, alignSelf: "center" }]}>
              <CurrentUserAvatar size={164} />
            </View>
          ) : null}
          {isBiometricsEnabled ? (
            <BiometricsUnlock userUuid={user.uuid} />
          ) : (
            <PasswordUnlock userUuid={user.uuid} />
          )}
          <LinkButton
            label="Having trouble logging in?"
            onPress={() => {
              setIsModalVisible(true);
            }}
          />
        </View>
      </Screen>
      <BottomSheetHelpModal
        showResetButton
        isVisible={isModalVisible}
        resetVisibility={() => {
          setIsModalVisible(() => false);
        }}
      />
    </KeyboardAvoidingView>
  );
}

function BiometricsUnlock({ userUuid }: { userUuid: string }) {
  const background = useBackgroundClient();
  const { biometricName } = useDeviceSupportsBiometricAuth();

  const tryBiometricsUnlock = async () => {
    try {
      const res = await tryLocalAuthenticate();
      if (res === BiometricAuthenticationStatus.Authenticated) {
        await background.request({
          method: UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
          params: [BIOMETRIC_PASSWORD, userUuid],
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    tryBiometricsUnlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // runs only once so it doesn't run on setting change

  return (
    <PrimaryButton
      label={`Login with ${biometricName}`}
      onPress={tryBiometricsUnlock}
    />
  );
}

function PasswordUnlock({ userUuid }: { userUuid: string }): JSX.Element {
  const background = useBackgroundClient();
  const { control, handleSubmit, formState, setError } = useForm<FormData>();

  const onSubmit = async ({ password }: FormData) => {
    await maybeUnlock({ password });
  };

  const maybeUnlock = async ({ password }: FormData) => {
    try {
      await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
        params: [password, userUuid],
      });
    } catch (error: any) {
      setError("password", { message: error });
    }
  };

  return (
    <YStack space={8}>
      <PasswordInput
        onSubmitEditing={handleSubmit(onSubmit)}
        returnKeyType="done"
        autoFocus
        placeholder="Password"
        name="password"
        control={control}
        rules={{
          required: "You must enter a password",
        }}
      />
      {formState.errors.password ? (
        <ErrorMessage for={formState.errors.password} />
      ) : null}
      <PrimaryButton label="Unlock" onPress={handleSubmit(onSubmit)} />
    </YStack>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
  },
});

export function LockedScreen(): JSX.Element {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <ScreenError error={error} />}
    >
      <Suspense fallback={<ScreenLoading />}>
        <Container />
      </Suspense>
    </ErrorBoundary>
  );
}

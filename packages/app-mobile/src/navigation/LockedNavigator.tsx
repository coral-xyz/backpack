import { useState, Suspense, useEffect, useCallback } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";

import { UI_RPC_METHOD_KEYRING_STORE_UNLOCK } from "@coral-xyz/common";
import { useBackgroundClient, useUser } from "@coral-xyz/recoil";
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
  Margin,
  PrimaryButton,
  Screen,
  WelcomeLogoHeader,
  ScreenError,
  ScreenLoading,
} from "~components/index";

import {
  BIOMETRIC_PASSWORD,
  BiometricAuthenticationStatus,
  tryLocalAuthenticate,
} from "~src/features/biometrics";

interface FormData {
  password: string;
}

function Container(): JSX.Element {
  const background = useBackgroundClient();
  const user = useUser();
  const insets = useSafeAreaInsets();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { control, handleSubmit, formState, setError } = useForm<FormData>();

  const maybeUnlock = useCallback(
    async ({ password }: FormData) => {
      try {
        await background.request({
          method: UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
          params: [password, user.uuid],
        });
      } catch (error: any) {
        setError("password", { message: error });
      }
    },
    [background, setError, user.uuid]
  );

  const onSubmit = async ({ password }: FormData) => {
    await maybeUnlock({ password });
  };

  useEffect(() => {
    (async function handleAuth() {
      try {
        const res = await tryLocalAuthenticate();
        if (res === BiometricAuthenticationStatus.Authenticated) {
          await maybeUnlock({ password: BIOMETRIC_PASSWORD });
        }
      } catch (error) {
        console.error(error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // runs only once so it doesn't run on setting change

  // useEffect(() => {
  //   async function f() {
  //     await background.request({
  //       method: UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
  //       params: ["backpack", user.uuid],
  //     });
  //   }
  //
  //   f();
  // });

  return (
    <>
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
          <Margin top={48} bottom={24}>
            <WelcomeLogoHeader />
          </Margin>
          <View>
            <Margin bottom={8}>
              <PasswordInput
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
            </Margin>
            <PrimaryButton label="Unlock" onPress={handleSubmit(onSubmit)} />
          </View>
        </Screen>
      </KeyboardAvoidingView>
      <BottomSheetHelpModal
        showResetButton
        isVisible={isModalVisible}
        resetVisibility={() => {
          setIsModalVisible(() => false);
        }}
      />
    </>
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

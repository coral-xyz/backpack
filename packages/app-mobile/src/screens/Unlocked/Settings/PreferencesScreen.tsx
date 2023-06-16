import { Suspense, useState } from "react";
import { Alert } from "react-native";

import {
  BACKPACK_CONFIG_VERSION,
  Blockchain,
  UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE,
  toTitleCase,
} from "@coral-xyz/common";
import { useBackgroundClient, useDarkMode } from "@coral-xyz/recoil";
import { Stack } from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";

import {
  RoundedContainerGroup,
  Screen,
  ScreenError,
  ScreenLoading,
} from "~components/index";

import {
  IconPushDetail,
  SettingsRow,
  SettingsRowSwitch,
  SettingsRowText,
} from "./components/SettingsRow";

import {
  BiometricAuthenticationStatus,
  // BIOMETRIC_PASSWORD,
  tryLocalAuthenticate,
} from "~src/features/biometrics";
import {
  biometricAuthenticationSuccessful,
  useDeviceSupportsBiometricAuth,
  useOsBiometricAuthEnabled,
} from "~src/features/biometrics/hooks";
import * as Linking from "~src/lib/linking";

function SettingsDarkMode() {
  const [loading, setLoading] = useState(false);
  const background = useBackgroundClient();
  const isDarkMode = useDarkMode();

  const onDarkModeSwitch = async (isDarkMode: boolean) => {
    setLoading(true);
    await background.request({
      method: UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE,
      params: [isDarkMode],
    });
    setLoading(false);
  };

  return (
    <SettingsRowSwitch
      loading={loading}
      value={isDarkMode}
      label="Dark Mode"
      onPress={onDarkModeSwitch}
    />
  );
}

function SettingsBiometricsMode() {
  const [loading, setLoading] = useState(false);
  const { touchId: isTouchIdDevice } = useDeviceSupportsBiometricAuth();
  const isSupported = useDeviceSupportsBiometricAuth();
  const isEnabled = useOsBiometricAuthEnabled();
  if (!isSupported) {
    return null;
  }

  const onBiometricSwitch = async () => {
    setLoading(true);
    const authStatus = await tryLocalAuthenticate({
      disableDeviceFallback: true,
    });

    if (
      authStatus === BiometricAuthenticationStatus.Unsupported ||
      authStatus === BiometricAuthenticationStatus.MissingEnrollment
    ) {
      Alert.alert(
        `${biometricName} is disabled`,
        `To enable ${biometricName}, allow access in system settings`,
        [
          {
            text: "Settings",
            onPress: Linking.openSettings,
          },
          { text: "Not now" },
        ]
      );
    }

    if (biometricAuthenticationSuccessful(authStatus)) {
      console.log("warn folks password is different now or something");
    }

    setLoading(false);
  };

  const biometricName = isTouchIdDevice ? "Touch ID" : "Face ID";
  return (
    <SettingsRowSwitch
      loading={loading}
      value={Boolean(isEnabled)}
      label={`Enable ${biometricName}`}
      onPress={onBiometricSwitch}
    />
  );
}

function Container({ navigation }) {
  return (
    <Screen>
      <Stack mb={12}>
        <RoundedContainerGroup>
          <SettingsRow
            label="Trusted Sites"
            onPress={() => navigation.push("PreferencesTrustedSites")}
            detailIcon={<IconPushDetail />}
          />
          <SettingsDarkMode />
          <SettingsBiometricsMode />
        </RoundedContainerGroup>
      </Stack>
      <Stack mb={12}>
        <RoundedContainerGroup>
          <SettingsRow
            label={toTitleCase(Blockchain.SOLANA)}
            detailIcon={<IconPushDetail />}
            onPress={() =>
              navigation.push("PreferencesSolana", {
                blockchain: Blockchain.SOLANA,
              })
            }
          />
          <SettingsRow
            label={toTitleCase(Blockchain.ETHEREUM)}
            detailIcon={<IconPushDetail />}
            onPress={() =>
              navigation.push("PreferencesEthereum", {
                blockchain: Blockchain.ETHEREUM,
              })
            }
          />
        </RoundedContainerGroup>
      </Stack>
      <Stack mb={12}>
        <RoundedContainerGroup>
          <SettingsRowText
            label="Version"
            detailText={BACKPACK_CONFIG_VERSION}
          />
        </RoundedContainerGroup>
      </Stack>
    </Screen>
  );
}

export function PreferencesScreen({ navigation }): JSX.Element {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <ScreenError error={error} />}
    >
      <Suspense fallback={<ScreenLoading />}>
        <Container navigation={navigation} />
      </Suspense>
    </ErrorBoundary>
  );
}

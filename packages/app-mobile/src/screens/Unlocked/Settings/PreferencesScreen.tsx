import { Suspense, useState } from "react";
import { Alert } from "react-native";

import { BACKPACK_CONFIG_VERSION, Blockchain } from "@coral-xyz/common";
import { YStack } from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";

import {
  RoundedContainerGroup,
  Screen,
  ScreenError,
  ScreenLoading,
} from "~components/index";
import { SettingsList } from "~screens/Unlocked/Settings/components/SettingsMenuList";

import { SettingsRowSwitch, SettingsRowText } from "./components/SettingsRow";

import {
  BiometricAuthenticationStatus,
  tryLocalAuthenticate,
} from "~src/features/biometrics";
import {
  biometricAuthenticationSuccessful,
  useDeviceSupportsBiometricAuth,
  useOsBiometricAuthEnabled,
} from "~src/features/biometrics/hooks";
import * as Linking from "~src/lib/linking";

function SettingsBiometricsMode() {
  const [loading, setLoading] = useState(false);
  const { biometricName } = useDeviceSupportsBiometricAuth();
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

  return (
    <RoundedContainerGroup>
      <SettingsRowSwitch
        loading={loading}
        value={Boolean(isEnabled)}
        label={`Enable ${biometricName}`}
        onPress={onBiometricSwitch}
      />
    </RoundedContainerGroup>
  );
}

function Container({ navigation }) {
  const menuItems = {
    Solana: {
      onPress: () => {
        navigation.push("PreferencesSolana", {
          blockchain: Blockchain.SOLANA,
        });
      },
    },
    Ethereum: {
      onPress: () => {
        navigation.push("PreferencesEthereum", {
          blockchain: Blockchain.ETHEREUM,
        });
      },
    },
  };

  return (
    <Screen>
      <YStack space="$settingsList">
        <SettingsBiometricsMode />
        <SettingsList menuItems={menuItems} />
        <RoundedContainerGroup>
          <SettingsRowText
            label="Version"
            detailText={BACKPACK_CONFIG_VERSION}
          />
        </RoundedContainerGroup>
      </YStack>
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

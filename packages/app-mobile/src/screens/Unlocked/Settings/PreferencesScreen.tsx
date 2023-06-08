import { Suspense, useState } from "react";
import { Alert } from "react-native";

import {
  BACKPACK_CONFIG_VERSION,
  Blockchain,
  UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE,
  UI_RPC_METHOD_SETTINGS_DEVELOPER_MODE_UPDATE,
  toTitleCase,
} from "@coral-xyz/common";
import {
  useBackgroundClient,
  useDarkMode,
  useDeveloperMode,
} from "@coral-xyz/recoil";
import { Stack } from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";

import {
  ScreenError,
  ScreenLoading,
  RoundedContainerGroup,
  Screen,
} from "~components/index";

import {
  IconPushDetail,
  SettingsRow,
  SettingsRowSwitch,
  SettingsRowText,
} from "./components/SettingsRow";

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
      onPress={(value) => onDarkModeSwitch(value)}
    />
  );
}

function SettingsDeveloperMode() {
  const [loading, setLoading] = useState(false);
  const background = useBackgroundClient();
  const isDeveloperMode = useDeveloperMode();

  const onDeveloperModeSwitch = async (isDeveloperMode: boolean) => {
    setLoading(true);
    await background.request({
      method: UI_RPC_METHOD_SETTINGS_DEVELOPER_MODE_UPDATE,
      params: [isDeveloperMode],
    });
    setLoading(false);
  };

  return (
    <SettingsRowSwitch
      loading={loading}
      value={isDeveloperMode}
      label="Developer Mode"
      onPress={(value) => onDeveloperModeSwitch(value)}
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
          <SettingsRow
            label="Biometrics"
            onPress={() => {
              Alert.alert(
                "Coming Soon",
                "Screen Unlock, transaction signing, etc"
              );
            }}
            // onPress={() => navigation.push("PreferencesBiometrics")}
            detailIcon={<IconPushDetail />}
          />
          <SettingsDarkMode />
          <SettingsDeveloperMode />
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

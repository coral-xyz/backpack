import {
  BACKPACK_CONFIG_VERSION,
  Blockchain,
  UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE,
  UI_RPC_METHOD_SETTINGS_DEVELOPER_MODE_UPDATE,
} from "@coral-xyz/common";
import {
  useBackgroundClient,
  // getBlockchainLogo,
  useDarkMode,
  useDeveloperMode,
} from "@coral-xyz/recoil";

import { Margin, RoundedContainerGroup, Screen } from "~components/index";

import {
  IconPushDetail,
  SettingsRow,
  SettingsRowSwitch,
  SettingsRowText,
} from "./components/SettingsRow";

export function PreferencesScreen({ navigation }) {
  // const theme = useTheme();
  const background = useBackgroundClient();
  const isDarkMode = useDarkMode();
  const isDeveloperMode = useDeveloperMode();

  const onDarkModeSwitch = async (isDarkMode: boolean) => {
    await background.request({
      method: UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE,
      params: [isDarkMode],
    });
  };

  const onDeveloperModeSwitch = async (isDeveloperMode: boolean) => {
    await background.request({
      method: UI_RPC_METHOD_SETTINGS_DEVELOPER_MODE_UPDATE,
      params: [isDeveloperMode],
    });
  };

  return (
    <Screen>
      <Margin vertical={12}>
        <RoundedContainerGroup>
          <SettingsRow
            label="Auto-lock Timer"
            onPress={() => navigation.push("Preferences")}
            detailIcon={<IconPushDetail />}
          />
          <SettingsRow
            label="Trusted Sites"
            onPress={() => navigation.push("PreferencesTrustedSites")}
            detailIcon={<IconPushDetail />}
          />
          <SettingsRowSwitch
            value={isDarkMode}
            label="Dark Mode"
            onPress={(value) => onDarkModeSwitch(value)}
          />
          <SettingsRowSwitch
            value={isDeveloperMode}
            label="Developer Mode"
            onPress={(value) => onDeveloperModeSwitch(value)}
          />
        </RoundedContainerGroup>
      </Margin>
      <Margin bottom={12}>
        <RoundedContainerGroup>
          <SettingsRow
            label={Blockchain.SOLANA}
            detailIcon={<IconPushDetail />}
            onPress={() =>
              navigation.push("PreferencesSolana", {
                blockchain: Blockchain.SOLANA,
              })
            }
          />
          <SettingsRow
            label={Blockchain.ETHEREUM}
            detailIcon={<IconPushDetail />}
            onPress={() =>
              navigation.push("PreferencesEthereum", {
                blockchain: Blockchain.ETHEREUM,
              })
            }
          />
        </RoundedContainerGroup>
      </Margin>
      <Margin bottom={12}>
        <RoundedContainerGroup>
          <SettingsRowText
            label="Version"
            detailText={BACKPACK_CONFIG_VERSION}
          />
        </RoundedContainerGroup>
      </Margin>
    </Screen>
  );
}

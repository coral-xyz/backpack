import type { Blockchain } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import type { StackScreenProps } from "@react-navigation/stack";
import { createStackNavigator } from "@react-navigation/stack";

import { WalletSettingsButton } from "../../components/common/WalletList";
import { WalletRemoveConfirmationScreen } from "../../components/Unlocked/Settings/YourAccount/EditWallets/RemoveWalletConfirmationScreen";
import { AboutScreen } from "../screens/Unlocked/Settings/AboutScreen";
import { PreferencesAutolockScreen } from "../screens/Unlocked/Settings/PreferencesAutolockScreen";
import { PreferencesBlockchainCommitmentScreen } from "../screens/Unlocked/Settings/PreferencesBlockchainCommitmentScreen";
import { PreferencesBlockchainExplorerScreen } from "../screens/Unlocked/Settings/PreferencesBlockchainExplorerScreen";
import { PreferencesBlockchainRpcConnectionCustomScreen } from "../screens/Unlocked/Settings/PreferencesBlockchainRpcConnectionCustomScreen";
import { PreferencesBlockchainRpcConnectionScreen } from "../screens/Unlocked/Settings/PreferencesBlockchainRpcConnectionScreen";
import { PreferencesBlockchainScreen } from "../screens/Unlocked/Settings/PreferencesBlockchainScreen";
import { PreferencesHiddenTokensScreen } from "../screens/Unlocked/Settings/PreferencesHiddenTokenScreen";
import { PreferencesLanguageScreen } from "../screens/Unlocked/Settings/PreferencesLanguageScreen";
import { PreferencesScreen } from "../screens/Unlocked/Settings/PreferencesScreen";
import { PreferencesTrustedSitesScreen } from "../screens/Unlocked/Settings/PreferencesTrustedSitesScreen";
import { SettingsScreen } from "../screens/Unlocked/Settings/SettingsScreen";
import { WalletAddBackpackRecoveryPhraseScreen } from "../screens/Unlocked/Settings/WalletAddBackpackRecoveryPhraseScreen";
import { WalletAddBlockchainSelectScreen } from "../screens/Unlocked/Settings/WalletAddBlockchainSelectScreen";
import { WalletAddDeriveRecoveryPhraseScreen } from "../screens/Unlocked/Settings/WalletAddDeriveRecoveryPhraseScreen";
import { WalletAddHardwareScreen } from "../screens/Unlocked/Settings/WalletAddHardwareScreen";
import { WalletAddPrivateKeyScreen } from "../screens/Unlocked/Settings/WalletAddPrivateKeyScreen";
import { WalletAddScreen } from "../screens/Unlocked/Settings/WalletAddScreen";
import { WalletCreateMnemonicScreen } from "../screens/Unlocked/Settings/WalletCreateMnemonicScreen";
import { WalletCreateOrImportMnemonicScreen } from "../screens/Unlocked/Settings/WalletCreateOrImportMnemonicScreen";
import { WalletDetailScreen } from "../screens/Unlocked/Settings/WalletDetailScreen";
import { WalletPrivateKeyWarningScreen } from "../screens/Unlocked/Settings/WalletPrivateKeyWarningScreen";
import { WalletRemoveScreen } from "../screens/Unlocked/Settings/WalletRemoveScreen";
import { WalletRenameScreen } from "../screens/Unlocked/Settings/WalletRenameScreen";
import { WalletSetMnemonicScreen } from "../screens/Unlocked/Settings/WalletSetMnemonicScreen";
import { WalletsScreen } from "../screens/Unlocked/Settings/WalletsScreen";
import { YourAccountChangePasswordScreen } from "../screens/Unlocked/Settings/YourAccountChangePasswordScreen";
import { YourAccountRemoveScreen } from "../screens/Unlocked/Settings/YourAccountRemoveScreen";
import { YourAccountScreen } from "../screens/Unlocked/Settings/YourAccountScreen";
import { YourAccountShowMnemonicWarningScreen } from "../screens/Unlocked/Settings/YourAccountShowMnemonicWarningScreen";
import { YourAccountUpdateNameScreen } from "../screens/Unlocked/Settings/YourAccountUpdateNameScreen";

import { headerStyles, maybeCloseButton, NavButtonContainer } from "./utils";
import type { SettingsNavigatorProps } from "./WalletsNavigator";

export enum Routes {
  SettingsScreen = "SettingsScreen",

  WalletsScreen = "WalletsScreen",
  WalletDetailScreen = "WalletDetailScreen",
  WalletRenameScreen = "WalletRenameScreen",
  WalletPrivateKeyWarningScreen = "WalletPrivateKeyWarningScreen",
  WalletRemoveScreen = "WalletRemoveScreen",
  WalletRemoveConfirmationScreen = "WalletRemoveConfirmationScreen",
  WalletAddScreen = "WalletAddScreen",
  WalletAddBlockchainSelectScreen = "WalletAddBlockchainSelectScreen",
  WalletCreateOrImportMnemonicScreen = "WalletCreateOrImportMnemonicScreen",
  WalletCreateMnemonicScreen = "WalletCreateMnemonicScreen",
  WalletSetMnemonicScreen = "WalletSetMnemonicScreen",
  WalletAddBackpackRecoveryPhraseScreen = "WalletAddBackpackRecoveryPhraseScreen",
  WalletAddDeriveRecoveryPhraseScreen = "WalletAddDeriveRecoveryPhraseScreen",
  WalletAddPrivateKeyScreen = "WalletAddPrivateKeyScreen",
  WalletAddHardwareScreen = "WalletAddHardwareScreen",

  YourAccountScreen = "YourAccountScreen",
  YourAccountUpdateNameScreen = "YourAccountUpdateNameScreen",
  YourAccountChangePasswordScreen = "YourAccountChangePasswordScreen",
  YourAccountShowMnemonicWarningScreen = "YourAccountShowMnemonicWarningScreen",
  YourAccountRemoveScreen = "YourAccountRemoveScreen",

  PreferencesScreen = "PreferencesScreen",
  PreferencesAutolockScreen = "PreferencesAutolockScreen",
  PreferencesTrustedSitesScreen = "PreferencesTrustedSitesScreen",
  PreferencesLanguageScreen = "PreferencesLanguageScreen",
  PreferencesHiddenTokensScreen = "PreferencesHiddenTokensScreen",
  PreferencesBlockchainScreen = "PreferencesBlockchainScreen",
  PreferencesBlockchainRpcConnectionScreen = "PreferencesBlockchainRpcConnection",
  PreferencesBlockchainCommitmentScreen = "PreferencesBlockchainCommitment",
  PreferencesBlockchainExplorerScreen = "PreferencesBlockchainExplorerer",
  PreferencesBlockchainRpcConnectionCustomScreen = "PreferencesBlockchainRpcConnectionCustomScreen",

  AboutScreen = "AboutScreen",
}

type SettingsScreenStackNavigatorParamList = {
  [Routes.SettingsScreen]: undefined;

  [Routes.WalletsScreen]: undefined;
  [Routes.WalletDetailScreen]: {
    blockchain: Blockchain;
    publicKey: string;
    name: string;
    type: string;
    isActive: boolean;
  };
  [Routes.WalletRenameScreen]: {
    publicKey: string;
    name: string;
    blockchain: Blockchain;
  };
  [Routes.WalletPrivateKeyWarningScreen]: {
    publicKey: string;
  };
  [Routes.WalletRemoveScreen]: {
    blockchain: Blockchain;
    publicKey: string;
    type: string;
  };
  [Routes.WalletRemoveConfirmationScreen]: undefined;
  [Routes.WalletAddScreen]: {
    blockchain: Blockchain;
    publicKey?: string;
  };
  [Routes.WalletAddBlockchainSelectScreen]: undefined;
  [Routes.WalletCreateOrImportMnemonicScreen]: {
    blockchain: Blockchain;
  };
  [Routes.WalletCreateMnemonicScreen]: {
    blockchain: Blockchain;
  };
  [Routes.WalletSetMnemonicScreen]: {
    blockchain: Blockchain;
  };
  [Routes.WalletAddBackpackRecoveryPhraseScreen]: {
    blockchain: Blockchain;
  };
  [Routes.WalletAddDeriveRecoveryPhraseScreen]: {
    blockchain: Blockchain;
  };
  [Routes.WalletAddPrivateKeyScreen]: {
    blockchain: Blockchain;
  };
  [Routes.WalletAddHardwareScreen]: {
    blockchain: Blockchain;
  };

  [Routes.YourAccountScreen]: undefined;
  [Routes.YourAccountUpdateNameScreen]: undefined;
  [Routes.YourAccountChangePasswordScreen]: undefined;
  [Routes.YourAccountShowMnemonicWarningScreen]: undefined;
  [Routes.YourAccountRemoveScreen]: undefined;

  [Routes.PreferencesScreen]: undefined;
  [Routes.PreferencesAutolockScreen]: undefined;
  [Routes.PreferencesTrustedSitesScreen]: undefined;
  [Routes.PreferencesLanguageScreen]: undefined;
  [Routes.PreferencesHiddenTokensScreen]: undefined;
  [Routes.PreferencesBlockchainScreen]: {
    blockchain: Blockchain;
  };
  [Routes.PreferencesBlockchainRpcConnectionScreen]: {
    blockchain: Blockchain;
  };
  [Routes.PreferencesBlockchainCommitmentScreen]: {
    blockchain: Blockchain;
  };
  [Routes.PreferencesBlockchainExplorerScreen]: {
    blockchain: Blockchain;
  };
  [Routes.PreferencesBlockchainRpcConnectionCustomScreen]: {
    blockchain: Blockchain;
  };

  [Routes.AboutScreen]: undefined;
};

export type SettingsScreenProps<
  T extends keyof SettingsScreenStackNavigatorParamList
> = StackScreenProps<SettingsScreenStackNavigatorParamList, T>;

const Stack = createStackNavigator<SettingsScreenStackNavigatorParamList>();

export function SettingsNavigator({
  route: {
    params: { screen },
  },
}: SettingsNavigatorProps) {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      initialRouteName={screen}
      screenOptions={({ navigation: _ }) => {
        return {
          ...(headerStyles as any),
        };
      }}
    >
      <Stack.Screen
        name={Routes.SettingsScreen}
        component={SettingsScreen}
        options={({ navigation }) => {
          return {
            title: "",
            ...maybeCloseButton(
              screen === Routes.SettingsScreen,
              navigation,
              "go-back"
            ),
          };
        }}
      />
      <Stack.Screen
        name={Routes.WalletsScreen}
        component={WalletsScreen}
        options={({ navigation }) => {
          return {
            title: t("wallets"),
            ...maybeCloseButton(
              screen === Routes.WalletsScreen,
              navigation,
              "go-back"
            ),
            headerRight: (_props: any) => (
              <NavButtonContainer>
                <WalletSettingsButton />
              </NavButtonContainer>
            ),
          };
        }}
      />
      <Stack.Screen
        name={Routes.WalletDetailScreen}
        component={WalletDetailScreen}
        options={({
          navigation,
          route: {
            params: { name },
          },
        }) => {
          return {
            title: name,
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.WalletRenameScreen}
        component={WalletRenameScreen}
        options={({ navigation }) => {
          return {
            title: t("rename_wallet"),
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.WalletPrivateKeyWarningScreen}
        component={WalletPrivateKeyWarningScreen}
        options={({ navigation }) => {
          return {
            title: t("show_private_key"),
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.WalletRemoveScreen}
        component={WalletRemoveScreen}
        options={({ navigation }) => {
          return {
            title: t("remove_wallet"),
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.WalletRemoveConfirmationScreen}
        component={WalletRemoveConfirmationScreen}
        options={() => {
          return {
            title: t("remove_wallet"),
            headerLeft: () => null,
          };
        }}
      />
      <Stack.Screen
        name={Routes.WalletAddScreen}
        component={WalletAddScreen}
        options={({ navigation }) => {
          return {
            title: "",
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.WalletAddBlockchainSelectScreen}
        component={WalletAddBlockchainSelectScreen}
        options={({ navigation }) => {
          return {
            title: "",
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.WalletCreateOrImportMnemonicScreen}
        component={WalletCreateOrImportMnemonicScreen}
        options={({ navigation }) => {
          return {
            title: "",
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.WalletCreateMnemonicScreen}
        component={WalletCreateMnemonicScreen}
        options={({ navigation }) => {
          return {
            title: "",
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.WalletSetMnemonicScreen}
        component={WalletSetMnemonicScreen}
        options={({ navigation }) => {
          return {
            title: "",
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.WalletAddBackpackRecoveryPhraseScreen}
        component={WalletAddBackpackRecoveryPhraseScreen}
        options={({ navigation }) => {
          return {
            title: "",
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.WalletAddDeriveRecoveryPhraseScreen}
        component={WalletAddDeriveRecoveryPhraseScreen}
        options={({ navigation }) => {
          return {
            title: "",
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.WalletAddPrivateKeyScreen}
        component={WalletAddPrivateKeyScreen}
        options={({ navigation }) => {
          return {
            title: "",
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.WalletAddHardwareScreen}
        component={WalletAddHardwareScreen}
        options={({ navigation }) => {
          return {
            title: "",
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.YourAccountScreen}
        component={YourAccountScreen}
        options={({ navigation }) => {
          return {
            title: t("your_account"),
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.YourAccountUpdateNameScreen}
        component={YourAccountUpdateNameScreen}
        options={({ navigation }) => {
          return {
            title: t("update_account_name"),
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.YourAccountChangePasswordScreen}
        component={YourAccountChangePasswordScreen}
        options={({ navigation }) => {
          return {
            title: t("change_password"),
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.YourAccountShowMnemonicWarningScreen}
        component={YourAccountShowMnemonicWarningScreen}
        options={({ navigation }) => {
          return {
            title: t("show_recovery_phrase"),
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.YourAccountRemoveScreen}
        component={YourAccountRemoveScreen}
        options={({ navigation }) => {
          return {
            title: t("remove"),
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.PreferencesScreen}
        component={PreferencesScreen}
        options={({ navigation }) => {
          return {
            title: t("preferences"),
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.PreferencesAutolockScreen}
        component={PreferencesAutolockScreen}
        options={({ navigation }) => {
          return {
            title: t("auto_lock_timer"),
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.PreferencesTrustedSitesScreen}
        component={PreferencesTrustedSitesScreen}
        options={({ navigation }) => {
          return {
            title: t("trusted_sites"),
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.PreferencesLanguageScreen}
        component={PreferencesLanguageScreen}
        options={({ navigation }) => {
          return {
            title: t("language"),
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.PreferencesHiddenTokensScreen}
        component={PreferencesHiddenTokensScreen}
        options={({ navigation }) => {
          return {
            title: t("hidden_tokens"),
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.PreferencesBlockchainScreen}
        component={PreferencesBlockchainScreen}
        options={({
          navigation,
          route: {
            params: { blockchain },
          },
        }) => {
          return {
            title: blockchain.slice(0, 1).toUpperCase() + blockchain.slice(1),
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.PreferencesBlockchainRpcConnectionScreen}
        component={PreferencesBlockchainRpcConnectionScreen}
        options={({ navigation }) => {
          return {
            title: t("rpc_connection"),
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.PreferencesBlockchainRpcConnectionCustomScreen}
        component={PreferencesBlockchainRpcConnectionCustomScreen}
        options={({ navigation }) => {
          return {
            title: t("change_rpc"),
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.PreferencesBlockchainCommitmentScreen}
        component={PreferencesBlockchainCommitmentScreen}
        options={({ navigation }) => {
          return {
            title: t("confirmation_commitment"),
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.PreferencesBlockchainExplorerScreen}
        component={PreferencesBlockchainExplorerScreen}
        options={({ navigation }) => {
          return {
            title: t("explorer"),
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.AboutScreen}
        component={AboutScreen}
        options={({ navigation }) => {
          return {
            title: t("about_backpack"),
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
    </Stack.Navigator>
  );
}

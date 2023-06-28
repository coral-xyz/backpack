import type { StackScreenProps } from "@react-navigation/stack";
import type { Commitment } from "@solana/web3.js";

import { useCallback, useMemo } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  View,
} from "react-native";

import {
  EthereumConnectionUrl,
  SolanaCluster,
  SolanaExplorer,
  UI_RPC_METHOD_ETHEREUM_CHAIN_ID_UPDATE,
  UI_RPC_METHOD_CONNECTION_URL_UPDATE,
  UI_RPC_METHOD_SOLANA_COMMITMENT_UPDATE,
  UI_RPC_METHOD_EXPLORER_UPDATE,
  formatWalletAddress,
  Blockchain,
} from "@coral-xyz/common";
import {
  useBackgroundClient,
  useEthereumConnectionUrl,
  useSolanaCommitment,
  useSolanaConnectionUrl,
  useSolanaExplorer,
} from "@coral-xyz/recoil";
import {
  PrimaryButton,
  RoundedContainerGroup,
  XStack,
} from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import { ethers } from "ethers";
import { useForm } from "react-hook-form";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconCheckmark } from "~components/Icon";
import { UserAccountMenu } from "~components/UserAccountsMenu";
import { Screen } from "~components/index";
import { useTheme } from "~hooks/useTheme";
import { HeaderAvatarButton, HeaderButton } from "~navigation/components";
import { AccountSettingsScreen } from "~screens/AccountSettingsScreen";
import { ImportPrivateKeyScreen } from "~screens/ImportPrivateKeyScreen";
import {
  LogoutWarningScreen,
  ResetWarningScreen,
  RemoveWalletScreen,
} from "~screens/ResetWarningScreen";
import { EditWalletDetailScreen } from "~screens/Unlocked/EditWalletDetailScreen";
import { EditWalletsScreen } from "~screens/Unlocked/EditWalletsScreen";
import { ForgotPasswordScreen } from "~screens/Unlocked/ForgotPasswordScreen";
import { RenameWalletScreen } from "~screens/Unlocked/RenameWalletScreen";
import {
  AddWalletPrivacyDisclaimer,
  AddWalletSelectBlockchain,
  AddWalletCreateOrImportScreen,
  AddWalletAdvancedImportScreen,
  ImportFromMnemonicScreen,
} from "~screens/Unlocked/Settings/AddConnectWalletScreen";
import { ChangePasswordScreen } from "~screens/Unlocked/Settings/ChangePasswordScreen";
import { PreferencesScreen } from "~screens/Unlocked/Settings/PreferencesScreen";
import { PreferencesTrustedSitesScreen } from "~screens/Unlocked/Settings/PreferencesTrustedSitesScreen";
import { ProfileScreen } from "~screens/Unlocked/Settings/ProfileScreen";
import { SettingsList } from "~screens/Unlocked/Settings/components/SettingsMenuList";
import {
  IconPushDetail,
  SettingsRow,
} from "~screens/Unlocked/Settings/components/SettingsRow";
import {
  ShowPrivateKeyScreen,
  ShowPrivateKeyWarningScreen,
} from "~screens/Unlocked/ShowPrivateKeyScreen";
import {
  ShowRecoveryPhraseScreen,
  ShowRecoveryPhraseWarningScreen,
} from "~screens/Unlocked/ShowRecoveryPhraseScreen";
import { YourAccountScreen } from "~screens/Unlocked/YourAccountScreen";

import { InputGroup, InputListItem } from "~src/components/Form";
import { AboutBackpackScreen } from "~src/screens/Unlocked/Settings/AboutBackpackScreen";
import { PublicKey } from "~src/types/types";

const { hexlify } = ethers.utils;

type AccountSettingsParamList = {
  Settings: undefined;
  Profile: undefined;
  YourAccount: undefined;
  "change-password": undefined;
  Preferences: undefined;
  PreferencesEthereum: undefined;
  PreferencesEthereumConnection: undefined;
  PreferencesEthereumCustomRpcUrl: undefined;
  PreferencesSolana: undefined;
  PreferencesSolanaConnection: undefined;
  PreferencesSolanaCommitment: undefined;
  PreferencesSolanaExplorer: undefined;
  PreferencesSolanaCustomRpcUrl: undefined;
  PreferencesTrustedSites: undefined;
  ImportFromMnemonic: {
    blockchain: Blockchain;
    keyringExists: boolean;
    inputMnemonic: boolean;
  };
  ImportPrivateKey: {
    blockchain: Blockchain;
  };
  "reset-warning": undefined;
  "show-secret-phrase-warning": undefined;
  "show-secret-phrase": {
    mnemonic: string;
  };
  "show-private-key-warning": {
    publicKey: PublicKey;
  };
  "show-private-key": {
    privateKey: string;
  };
  "edit-wallets": {
    blockchain: Blockchain;
    publicKey: PublicKey;
    type: string;
  };
  "about-backpack": undefined;
  "edit-wallets-rename": undefined;
  "edit-wallets-remove": undefined;
  "edit-wallets-wallet-detail": { name: string; publicKey: string };
  "add-wallet": undefined;
  "forgot-password": undefined;
  "logout-warning": undefined;
  UserAccountMenu: undefined;
  AddWalletPrivacyDisclaimer: undefined;
  AddWalletSelectBlockchain: undefined;
  AddWalletCreateOrImport: undefined;
  AddWalletAdvancedImport: {
    publicKey: PublicKey;
    blockchain: Blockchain;
  };
};

export type EditWalletsScreenProps = StackScreenProps<
  AccountSettingsParamList,
  "edit-wallets"
>;

const Checkmark = () => <IconCheckmark size={18} />;
const BlankItem = () => <View />;

const Stack = createStackNavigator<AccountSettingsParamList>();
export function AccountSettingsNavigator(): JSX.Element {
  const theme = useTheme();
  return (
    <Stack.Navigator initialRouteName="Settings">
      <Stack.Screen
        name="Settings"
        component={AccountSettingsScreen}
        options={({ navigation }) => {
          return {
            title: "Settings",
            headerLeft: (props) => (
              <XStack ml={16}>
                <HeaderAvatarButton {...props} navigation={navigation} />
              </XStack>
            ),
            headerTintColor: theme.custom.colors.fontColor,
            headerBackTitle: "Back",
          };
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ navigation }) => {
          return {
            headerShown: true,
            title: "Settings",
            headerLeft: () => (
              <XStack ml={16}>
                <HeaderButton name="menu" onPress={navigation.openDrawer} />
              </XStack>
            ),
            headerTintColor: theme.custom.colors.fontColor,
            headerBackTitle: "Back",
          };
        }}
      />
      <Stack.Group
        screenOptions={{ headerTintColor: theme.custom.colors.fontColor }}
      >
        <Stack.Screen
          name="YourAccount"
          component={YourAccountScreen}
          options={{
            title: "Your Account",
            // headerBackTitle: "Profile",
          }}
        />
        <Stack.Screen
          options={{ title: "Change Password" }}
          name="change-password"
          component={ChangePasswordScreen}
        />
        <Stack.Screen
          options={{ title: "Preferences" }}
          name="Preferences"
          component={PreferencesScreen}
        />
        <Stack.Screen
          options={{ title: "Preferences" }}
          name="PreferencesEthereum"
          component={PreferencesEthereum}
        />
        <Stack.Screen
          options={{ title: "Preferences" }}
          name="PreferencesEthereumConnection"
          component={PreferencesEthereumConnection}
        />
        <Stack.Screen
          options={{ title: "Change RPC Connection" }}
          name="PreferencesEthereumCustomRpcUrl"
          component={PreferencesEthereumCustomRpcUrl}
        />
        <Stack.Screen
          options={{ title: "Solana Preferences" }}
          name="PreferencesSolana"
          component={PreferencesSolana}
        />
        <Stack.Screen
          options={{ title: "Solana Connection" }}
          name="PreferencesSolanaConnection"
          component={PreferencesSolanaConnection}
        />
        <Stack.Screen
          options={{ title: "Solana Commitment" }}
          name="PreferencesSolanaCommitment"
          component={PreferencesSolanaCommitment}
        />
        <Stack.Screen
          options={{ title: "Solana Explorer" }}
          name="PreferencesSolanaExplorer"
          component={PreferencesSolanaExplorer}
        />
        <Stack.Screen
          options={{ title: "Change RPC Connection" }}
          name="PreferencesSolanaCustomRpcUrl"
          component={PreferencesSolanaCustomRpcUrl}
        />
        <Stack.Screen
          options={{ title: "Trusted Sites" }}
          name="PreferencesTrustedSites"
          component={PreferencesTrustedSitesScreen}
        />
        <Stack.Screen
          options={{ title: "Import Private Key" }}
          name="ImportPrivateKey"
          component={ImportPrivateKeyScreen}
        />
        <Stack.Screen
          name="reset-warning"
          component={ResetWarningScreen}
          options={{ title: "Warning" }}
        />
        <Stack.Screen
          name="show-secret-phrase-warning"
          component={ShowRecoveryPhraseWarningScreen}
          options={{ title: "Secret Recovery Phrase" }}
        />
        <Stack.Screen
          name="show-secret-phrase"
          component={ShowRecoveryPhraseScreen}
          options={{ title: "Secret Recovery Phrase" }}
        />
        <Stack.Screen
          name="show-private-key-warning"
          component={ShowPrivateKeyWarningScreen}
          options={{ title: "Show Private Key" }}
        />
        <Stack.Screen
          name="show-private-key"
          component={ShowPrivateKeyScreen}
          options={{ title: "Private Key" }}
        />
        <Stack.Screen
          name="edit-wallets"
          component={EditWalletsScreen}
          options={({ navigation }) => ({
            title: "Edit Wallets",
            headerRight: () => (
              <Pressable
                onPress={() => {
                  navigation.push("AddWalletPrivacyDisclaimer");
                }}
              >
                <MaterialIcons
                  name="add"
                  size={24}
                  color="black"
                  style={{ paddingRight: 16 }}
                />
              </Pressable>
            ),
          })}
        />
        <Stack.Screen
          name="edit-wallets-rename"
          component={RenameWalletScreen}
          options={{ title: "Rename Wallet" }}
        />
        <Stack.Screen
          name="edit-wallets-remove"
          component={RemoveWalletScreen}
          options={{ title: "Remove Wallet" }}
        />
        <Stack.Screen
          name="edit-wallets-wallet-detail"
          component={EditWalletDetailScreen}
          options={({ route }) => {
            const { name, publicKey } = route.params;
            return {
              title: `${name} (${formatWalletAddress(publicKey)})`,
            };
          }}
        />
        <Stack.Screen
          name="about-backpack"
          component={AboutBackpackScreen}
          options={{ title: "About" }}
        />
        <Stack.Screen
          options={{ title: "Warning" }}
          name="AddWalletPrivacyDisclaimer"
          component={AddWalletPrivacyDisclaimer}
        />
        <Stack.Screen
          options={{ title: "Select a network" }}
          name="AddWalletSelectBlockchain"
          component={AddWalletSelectBlockchain}
        />
        <Stack.Screen
          options={{ title: "Create or import wallet" }}
          name="AddWalletCreateOrImport"
          component={AddWalletCreateOrImportScreen}
        />
        <Stack.Screen
          options={{ title: "Advanced import" }}
          name="AddWalletAdvancedImport"
          component={AddWalletAdvancedImportScreen}
        />
        <Stack.Screen
          options={{ title: "Recovery Phrase" }}
          name="ImportFromMnemonic"
          component={ImportFromMnemonicScreen}
        />
      </Stack.Group>
      <Stack.Group
        screenOptions={{ presentation: "modal", headerShown: false }}
      >
        <Stack.Screen name="forgot-password" component={ForgotPasswordScreen} />
        <Stack.Screen name="logout-warning" component={LogoutWarningScreen} />
        <Stack.Screen
          name="UserAccountMenu"
          component={UserAccountMenu}
          options={{
            headerShown: true,
            headerTintColor: theme.custom.colors.fontColor,
            headerBackTitle: "Back",
            title: "Your Accounts",
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}

type SolanaRPCUrlFormData = { url: string };

function PreferencesSolanaCustomRpcUrl({ navigation }) {
  const insets = useSafeAreaInsets();
  const background = useBackgroundClient();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    setError,
  } = useForm<SolanaRPCUrlFormData>();

  const onSubmit = async ({ url }: SolanaRPCUrlFormData) => {
    try {
      await background.request({
        method: UI_RPC_METHOD_CONNECTION_URL_UPDATE,
        params: [url, Blockchain.SOLANA],
      });
    } catch (err) {
      console.error(err);
      setError("url", { message: "Incorrect URL" });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={72}
    >
      <Screen jc="space-between" style={{ marginBottom: insets.bottom }}>
        <InputGroup
          hasError={Boolean(errors.url)}
          errorMessage={errors.url?.message}
        >
          <InputListItem
            autoCorrect={false}
            autoCapitalize="none"
            keyboardType="url"
            autoComplete="off"
            title="RPC"
            placeholder="RPC Url"
            returnKeyType="done"
            name="url"
            onSubmitEditing={handleSubmit(onSubmit)}
            control={control}
            rules={{
              pattern:
                /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/,
              required: true,
            }}
          />
        </InputGroup>
        <PrimaryButton
          disabled={Boolean(!isDirty && !isValid)}
          label="Update network"
          onPress={handleSubmit(onSubmit)}
        />
      </Screen>
    </KeyboardAvoidingView>
  );
}

function PreferencesSolanaConnection({ navigation }) {
  const background = useBackgroundClient();
  const currentUrl = useSolanaConnectionUrl();

  const handleUpdate = useCallback(
    async (url: string) => {
      try {
        await background.request({
          method: UI_RPC_METHOD_CONNECTION_URL_UPDATE,
          params: [url, Blockchain.SOLANA],
        });
      } catch (err) {
        Alert.alert("Something went wrong", "Try again");
        console.error(err);
      }
    },
    [background]
  );

  const menuItems = useMemo(() => {
    return {
      "Mainnet (Beta)": {
        onPress: () => handleUpdate(SolanaCluster.MAINNET),
        detail:
          currentUrl === SolanaCluster.MAINNET ? <Checkmark /> : <BlankItem />,
      },
      Devnet: {
        onPress: () => handleUpdate(SolanaCluster.DEVNET),
        detail:
          currentUrl === SolanaCluster.DEVNET ? <Checkmark /> : <BlankItem />,
      },
      Localnet: {
        onPress: () => handleUpdate(SolanaCluster.LOCALNET),
        detail:
          currentUrl === SolanaCluster.LOCALNET ? <Checkmark /> : <BlankItem />,
      },
      Custom: {
        onPress: () => navigation.push("PreferencesSolanaCustomRpcUrl"),
        detail: null,
      },
    };
  }, [handleUpdate, currentUrl, navigation]);

  return (
    <Screen>
      <SettingsList menuItems={menuItems} />
    </Screen>
  );
}

export function PreferencesSolanaCommitment({ navigation }) {
  const commitment = useSolanaCommitment();
  const background = useBackgroundClient();

  const handleUpdate = useCallback(
    async (commitment: Commitment) => {
      try {
        await background.request({
          method: UI_RPC_METHOD_SOLANA_COMMITMENT_UPDATE,
          params: [commitment],
        });
      } catch (error) {
        Alert.alert("Something went wrong", "Try again");
        console.error(error);
      }
    },
    [background]
  );

  const menuItems = useMemo(() => {
    return {
      Processed: {
        onPress: () => handleUpdate("processed"),
        detail: commitment === "processed" ? <Checkmark /> : <BlankItem />,
      },
      Confirmed: {
        onPress: () => handleUpdate("confirmed"),
        detail: commitment === "confirmed" ? <Checkmark /> : <BlankItem />,
      },
      Finalized: {
        onPress: () => handleUpdate("finalized"),
        detail: commitment === "finalized" ? <Checkmark /> : <BlankItem />,
      },
    };
  }, [handleUpdate, commitment]);

  return (
    <Screen>
      <SettingsList menuItems={menuItems} />
    </Screen>
  );
}

export function PreferencesSolanaExplorer({ navigation }) {
  const background = useBackgroundClient();
  const explorer = useSolanaExplorer();

  const handleUpdate = useCallback(
    async (explorer: string) => {
      try {
        await background.request({
          method: UI_RPC_METHOD_EXPLORER_UPDATE,
          params: [explorer, Blockchain.SOLANA],
        });
      } catch (err) {
        Alert.alert("Something went wrong", "Try again");
        console.error(err);
      }
    },
    [background]
  );

  const menuItems = useMemo(() => {
    const items = {
      "Solana Beach": SolanaExplorer.SOLANA_BEACH,
      "Solana Explorer": SolanaExplorer.SOLANA_EXPLORER,
      "Solana FM": SolanaExplorer.SOLANA_FM,
      Solscan: SolanaExplorer.SOLSCAN,
      XRAY: SolanaExplorer.XRAY,
    };

    const menuItems = Object.entries(items).reduce(
      (acc, [name, url]) => ({
        ...acc,
        [name]: {
          onPress: () => handleUpdate(url),
          detail: explorer === url ? <Checkmark /> : <BlankItem />,
        },
      }),
      {} as React.ComponentProps<typeof SettingsList>["menuItems"]
    );

    return menuItems;
  }, [handleUpdate, explorer]);

  return (
    <Screen>
      <SettingsList menuItems={menuItems} />
    </Screen>
  );
}

function PreferencesSolana({ navigation }) {
  const menuItems = {
    "RPC Connection": {
      onPress: () => navigation.push("PreferencesSolanaConnection"),
    },
    "Confirmation Commitment": {
      onPress: () => navigation.push("PreferencesSolanaCommitment"),
    },
    Explorer: {
      onPress: () => navigation.push("PreferencesSolanaExplorer"),
    },
  };

  return (
    <Screen>
      <SettingsList menuItems={menuItems} />
    </Screen>
  );
}

async function changeEthereumNetwork(
  background: any,
  url: string,
  chainId?: string
) {
  await background.request({
    method: UI_RPC_METHOD_CONNECTION_URL_UPDATE,
    params: [url, Blockchain.ETHEREUM],
  });

  if (!chainId) {
    const provider = ethers.getDefaultProvider(url);
    const network = await provider.getNetwork();
    chainId = hexlify(network.chainId);
  }

  await background.request({
    method: UI_RPC_METHOD_ETHEREUM_CHAIN_ID_UPDATE,
    params: [chainId],
  });
}

type EthereumRPCFormData = {
  url: string;
  chainId: string;
};

function PreferencesEthereumCustomRpcUrl({ navigation }) {
  const insets = useSafeAreaInsets();
  const background = useBackgroundClient();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    setError,
  } = useForm<EthereumRPCFormData>();

  const onSubmit = async ({ url, chainId }: EthereumRPCFormData) => {
    try {
      await changeEthereumNetwork(background, url, chainId);
    } catch (err) {
      console.error(err);
      setError("url", { message: "Incorrect URL" });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={72}
    >
      <Screen jc="space-between" style={{ marginBottom: insets.bottom }}>
        <InputGroup
          hasError={Boolean(errors.url)}
          errorMessage={errors.url?.message}
        >
          <InputListItem
            autoCorrect={false}
            autoCapitalize="none"
            keyboardType="url"
            autoComplete="off"
            title="RPC"
            placeholder="RPC Url"
            returnKeyType="next"
            name="url"
            control={control}
            rules={{
              pattern:
                /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/,
              required: true,
            }}
          />
          <InputListItem
            autoCorrect={false}
            autoCapitalize="none"
            keyboardType="url"
            autoComplete="off"
            title="Chain ID"
            placeholder="Chain ID"
            returnKeyType="done"
            name="chainId"
            onSubmitEditing={handleSubmit(onSubmit)}
            control={control}
            rules={{
              required: true,
            }}
          />
        </InputGroup>
        <PrimaryButton
          disabled={Boolean(!isDirty && !isValid)}
          label="Update network"
          onPress={handleSubmit(onSubmit)}
        />
      </Screen>
    </KeyboardAvoidingView>
  );
}

function PreferencesEthereumConnection({ navigation }) {
  const background = useBackgroundClient();
  const currentUrl = useEthereumConnectionUrl();

  const handleUpdate = useCallback(
    async (url: string, chainId?: string) => {
      try {
        await changeEthereumNetwork(background, url, chainId);
      } catch (error) {
        Alert.alert("Something went wrong", "Try again");
        console.error(error);
      }
    },
    [background]
  );

  const menuItems = {
    Mainnet: {
      onPress: () => handleUpdate(EthereumConnectionUrl.MAINNET, "0x1"),
      detail:
        currentUrl === EthereumConnectionUrl.MAINNET ? (
          <Checkmark />
        ) : (
          <BlankItem />
        ),
    },
    "Görli Testnet": {
      onPress: () => handleUpdate(EthereumConnectionUrl.GOERLI, "0x5"),
      detail:
        currentUrl === EthereumConnectionUrl.GOERLI ? (
          <Checkmark />
        ) : (
          <BlankItem />
        ),
    },
    Custom: {
      onPress: () => navigation.push("PreferencesEthereumCustomRpcUrl"),
      detail: null,
    },
    // Localnet: {
    //   onPress: () => handleUpdate(EthereumConnectionUrl.LOCALNET),
    //   detail:
    //     currentUrl === EthereumConnectionUrl.LOCALNET ? (
    //       <Checkmark />
    //     ) : (
    //       <BlankItem />
    //     ),
    // },
  };

  return (
    <Screen>
      <SettingsList menuItems={menuItems} />
    </Screen>
  );
}

function PreferencesEthereum({ navigation }) {
  return (
    <Screen>
      <RoundedContainerGroup>
        <SettingsRow
          label="RPC Connection"
          onPress={() => navigation.push("PreferencesEthereumConnection")}
          detailIcon={<IconPushDetail />}
        />
      </RoundedContainerGroup>
    </Screen>
  );
}

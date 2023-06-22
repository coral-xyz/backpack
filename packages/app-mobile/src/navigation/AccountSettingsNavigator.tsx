import type { ChannelAppUiClient } from "@coral-xyz/common";
import type { StackScreenProps } from "@react-navigation/stack";
import type { Commitment } from "@solana/web3.js";

import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  EthereumConnectionUrl,
  SolanaCluster,
  SolanaExplorer,
  UI_RPC_METHOD_ETHEREUM_CHAIN_ID_UPDATE,
  UI_RPC_METHOD_ETHEREUM_CONNECTION_URL_UPDATE,
  UI_RPC_METHOD_SOLANA_COMMITMENT_UPDATE,
  UI_RPC_METHOD_SOLANA_CONNECTION_URL_UPDATE,
  UI_RPC_METHOD_SOLANA_EXPLORER_UPDATE,
  formatWalletAddress,
} from "@coral-xyz/common";
import {
  useBackgroundClient,
  useEthereumConnectionUrl,
  useSolanaCommitment,
  useSolanaConnectionUrl,
  useSolanaExplorer,
} from "@coral-xyz/recoil";
import { XStack } from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import { ethers } from "ethers";

// import { AccountSettingsBottomSheet } from "~components/AccountSettingsBottomSheet";
import { IconCheckmark } from "~components/Icon";
import {
  // AccountDropdownHeader,
  UserAccountMenu,
} from "~components/UserAccountsMenu";
import { Screen } from "~components/index";
import { useTheme } from "~hooks/useTheme";
import { HeaderAvatarButton, HeaderButton } from "~navigation/components";
import { AccountSettingsScreen } from "~screens/AccountSettingsScreen";
import { ImportPrivateKeyScreen } from "~screens/ImportPrivateKeyScreen";
import {
  LogoutWarningScreen,
  ResetWarningScreen,
} from "~screens/ResetWarningScreen";
import { EditWalletDetailScreen } from "~screens/Unlocked/EditWalletDetailScreen";
import { EditWalletsScreen } from "~screens/Unlocked/EditWalletsScreen";
import { ForgotPasswordScreen } from "~screens/Unlocked/ForgotPasswordScreen";
import { RenameWalletScreen } from "~screens/Unlocked/RenameWalletScreen";
import { AddConnectWalletScreen } from "~screens/Unlocked/Settings/AddConnectWalletScreen";
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

import { AboutBackpackScreen } from "~src/screens/Unlocked/Settings/AboutBackpackScreen";

const { hexlify } = ethers.utils;

function DummyScreen() {
  return <View style={{ flex: 1, backgroundColor: "red" }} />;
}

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
  xNFTSettings: undefined;
  WaitingRoom: undefined;
  "import-private-key": undefined;
  "reset-warning": undefined;
  "show-secret-phrase-warning": undefined;
  "show-secret-phrase": undefined;
  "show-private-key-warning": undefined;
  "show-private-key": undefined;
  "edit-wallets": undefined;
  "about-backpack": undefined;
  "edit-wallets-rename": undefined;
  "edit-wallets-wallet-detail": { name: string; publicKey: string };
  "add-wallet": undefined;
  "forgot-password": undefined;
  "logout-warning": undefined;
  UserAccountMenu: undefined;
};

export type EditWalletsScreenProps = StackScreenProps<
  AccountSettingsParamList,
  "edit-wallets"
>;

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
          options={{ title: "Preferences" }}
          name="PreferencesEthereumCustomRpcUrl"
          component={PreferencesEthereumCustomRpcUrl}
        />
        <Stack.Screen
          options={{ title: "Solana Preferences" }}
          name="PreferencesSolana"
          component={PreferencesSolana}
        />
        <Stack.Screen
          // options={{ title: "Preferences" }}
          name="PreferencesSolanaConnection"
          component={PreferencesSolanaConnection}
        />
        <Stack.Screen
          // options={{ title: "Preferences" }}
          name="PreferencesSolanaCommitment"
          component={PreferencesSolanaCommitment}
        />
        <Stack.Screen
          options={{ title: "Solana Explorer" }}
          name="PreferencesSolanaExplorer"
          component={PreferencesSolanaExplorer}
        />
        <Stack.Screen
          // options={{ title: "Preferences" }}
          name="PreferencesSolanaCustomRpcUrl"
          component={PreferencesSolanaCustomRpcUrl}
        />
        <Stack.Screen
          options={{ title: "Trusted Sites" }}
          name="PreferencesTrustedSites"
          component={PreferencesTrustedSitesScreen}
        />
        <Stack.Screen
          options={{ title: "xNFTs" }}
          name="xNFTSettings"
          component={DummyScreen}
        />
        <Stack.Screen
          options={{ title: "Waiting Room" }}
          name="WaitingRoom"
          component={DummyScreen}
        />
        <Stack.Screen
          options={{ title: "Import Private Key" }}
          name="import-private-key"
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
        />
        <Stack.Screen
          name="show-private-key-warning"
          component={ShowPrivateKeyWarningScreen}
          options={{ title: "Warning" }}
        />
        <Stack.Screen
          name="show-private-key"
          component={ShowPrivateKeyScreen}
          options={{ title: "Show Private Key" }}
        />
        <Stack.Screen
          name="edit-wallets"
          component={EditWalletsScreen}
          options={({ navigation }) => ({
            title: "Edit Wallets",
            headerRight: () => (
              <Pressable
                onPress={() => {
                  navigation.push("add-wallet");
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
          options={{ title: "Add / Connect Wallet" }}
          name="add-wallet"
          component={AddConnectWalletScreen}
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

function PreferencesSolanaCustomRpcUrl({ navigation }) {
  const [rpcUrl, setRpcUrl] = useState("");
  const [rpcUrlError, setRpcUrlError] = useState(false);

  useEffect(() => {
    if (!rpcUrl) {
      setRpcUrlError(false);
      return;
    }
    try {
      new URL(rpcUrl.trim());
      setRpcUrlError(false);
    } catch (e: any) {
      setRpcUrlError(true);
    }
  }, [rpcUrl]);

  // return (
  //   <div style={{ paddingTop: 16, height: "100%" }}>
  //     <form
  //       onSubmit={changeNetwork}
  //       style={{ display: "flex", height: "100%", flexDirection: "column" }}
  //     >
  //       <div style={{ flex: 1, flexGrow: 1 }}>
  //         <Inputs error={rpcUrlError}>
  //           <InputListItem
  //             isFirst={true}
  //             isLast={true}
  //             button={false}
  //             title={"RPC"}
  //             placeholder={"RPC URL"}
  //             value={rpcUrl}
  //             onChange={(e) => {
  //               setRpcUrl(e.target.value);
  //             }}
  //           />
  //         </Inputs>
  //       </div>
  //       <div style={{ padding: 16 }}>
  //         <PrimaryButton
  //           disabled={!rpcUrl || rpcUrlError}
  //           label="Switch"
  //           type="submit"
  //         />
  //       </div>
  //     </form>
  //   </div>
  // );

  return (
    <View style={{ padding: 16 }}>
      <Text>TODO form lists</Text>
      <Text>{JSON.stringify({ rpcUrl, rpcUrlError })}</Text>
    </View>
  );
}

function PreferencesSolanaConnection({ navigation }) {
  const background = useBackgroundClient();
  const currentUrl = useSolanaConnectionUrl();
  const menuItems = {
    "Mainnet (Beta)": {
      onPress: () => changeNetwork(SolanaCluster.MAINNET),
      detail: currentUrl === SolanaCluster.MAINNET ? <IconCheckmark /> : null,
    },
    Devnet: {
      onPress: () => changeNetwork(SolanaCluster.DEVNET),
      detail: currentUrl === SolanaCluster.DEVNET ? <IconCheckmark /> : null,
    },
    Localnet: {
      onPress: () => changeNetwork(SolanaCluster.LOCALNET),
      detail: currentUrl === SolanaCluster.LOCALNET ? <IconCheckmark /> : null,
    },
  };

  const changeNetwork = (url: string) => {
    try {
      background
        .request({
          method: UI_RPC_METHOD_SOLANA_CONNECTION_URL_UPDATE,
          params: [url],
        })
        .then(close)
        .catch(console.error);
    } catch (err) {
      console.error(err);
    }
  };

  return <SettingsList menuItems={menuItems} />;
}

export function PreferencesSolanaCommitment({ navigation }) {
  const commitment = useSolanaCommitment();
  const background = useBackgroundClient();

  const menuItems = {
    Processed: {
      onPress: () => changeCommitment("processed"),
      detail: commitment === "processed" ? <IconCheckmark /> : null,
    },
    Confirmed: {
      onPress: () => changeCommitment("confirmed"),
      detail: commitment === "confirmed" ? <IconCheckmark /> : null,
    },
    Finalized: {
      onPress: () => changeCommitment("finalized"),
      detail: commitment === "finalized" ? <IconCheckmark /> : null,
    },
  };

  const changeCommitment = (commitment: Commitment) => {
    background
      .request({
        method: UI_RPC_METHOD_SOLANA_COMMITMENT_UPDATE,
        params: [commitment],
      })
      .catch(console.error);
  };

  return <SettingsList menuItems={menuItems} />;
}

export function PreferencesSolanaExplorer({ navigation }) {
  const background = useBackgroundClient();
  const explorer = useSolanaExplorer();

  const menuItems = {
    "Solana Beach": SolanaExplorer.SOLANA_BEACH,
    "Solana Explorer": SolanaExplorer.SOLANA_EXPLORER,
    "Solana FM": SolanaExplorer.SOLANA_FM,
    Solscan: SolanaExplorer.SOLSCAN,
    XRAY: SolanaExplorer.XRAY,
  };

  const changeExplorer = (explorer: string) => {
    try {
      background
        .request({
          method: UI_RPC_METHOD_SOLANA_EXPLORER_UPDATE,
          params: [explorer],
        })
        .catch(console.error);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SettingsList
      menuItems={Object.entries(menuItems).reduce(
        (acc, [name, url]) => ({
          ...acc,
          [name]: {
            onPress: () => changeExplorer(url),
            detail: explorer === url ? <IconCheckmark /> : null,
          },
        }),
        {} as React.ComponentProps<typeof SettingsList>["menuItems"]
      )}
    />
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

export const changeNetwork = async (
  background: ChannelAppUiClient,
  url: string,
  chainId?: string
) => {
  await background.request({
    method: UI_RPC_METHOD_ETHEREUM_CONNECTION_URL_UPDATE,
    params: [url],
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
};

function PreferencesEthereumCustomRpcUrl({ navigation }) {
  const [rpcUrl, setRpcUrl] = useState("");
  const [chainId, setChainId] = useState("");
  const [rpcUrlError, setRpcUrlError] = useState(false);

  useEffect(() => {
    if (!rpcUrl) {
      setRpcUrlError(false);
      return;
    }
    try {
      new URL(rpcUrl.trim());
      setRpcUrlError(false);
    } catch (e: any) {
      setRpcUrlError(true);
    }
  }, [rpcUrl]);

  // <div style={{ paddingTop: 16, height: "100%" }}>
  //   <form
  //     onSubmit={async () => {
  //         await changeNetwork(background, rpcUrl, chainId);
  //       close();
  //     }}
  //     style={{ display: "flex", height: "100%", flexDirection: "column" }}
  //   >
  //     <div style={{ flex: 1, flexGrow: 1 }}>
  //       <Inputs error={rpcUrlError}>
  //         <InputListItem
  //           isLast={false}
  //           isFirst={true}
  //           button={false}
  //           title={"RPC"}
  //           placeholder={"RPC URL"}
  //           value={rpcUrl}
  //           onChange={(e) => {
  //             setRpcUrl(e.target.value);
  //           }}
  //         />
  //         <InputListItem
  //           isLast={true}
  //           isFirst={false}
  //           button={false}
  //           title={"Chain"}
  //           placeholder={"Chain ID"}
  //           value={chainId}
  //           onChange={(e) => setChainId(e.target.value)}
  //         />
  //       </Inputs>
  //     </div>
  //     <div style={{ padding: 16 }}>
  //       <PrimaryButton
  //         disabled={!rpcUrl || rpcUrlError}
  //         label="Switch"
  //         type="submit"
  //       />
  //     </div>
  //   </form>
  // </div>

  return (
    <View style={{ padding: 16 }}>
      <Text>TODO form lists</Text>
      <Text>{JSON.stringify({ rpcUrl, chainId, rpcUrlError })}</Text>
    </View>
  );
}

function PreferencesEthereumConnection({ navigation }) {
  const background = useBackgroundClient();
  const currentUrl = useEthereumConnectionUrl();

  const menuItems = {
    Mainnet: {
      onPress: async () => {
        await changeNetwork(background, EthereumConnectionUrl.MAINNET, "0x1");
        close();
      },
      detail:
        currentUrl === EthereumConnectionUrl.MAINNET ? <IconCheckmark /> : null,
    },
    "Görli Testnet": {
      onPress: async () => {
        await changeNetwork(background, EthereumConnectionUrl.GOERLI, "0x5");
        close();
      },
      detail:
        currentUrl === EthereumConnectionUrl.GOERLI ? <IconCheckmark /> : null,
    },
    Localnet: {
      onPress: async () => {
        await changeNetwork(background, EthereumConnectionUrl.LOCALNET);
        close();
      },
      detail:
        currentUrl === EthereumConnectionUrl.LOCALNET ? (
          <IconCheckmark />
        ) : null,
    },
  };

  return <SettingsList menuItems={menuItems} />;
}

function PreferencesEthereum({ navigation }) {
  return (
    <Screen>
      <SettingsRow
        label="RPC Connection"
        onPress={() => navigation.push("PreferencesEthereumConnection")}
        detailIcon={<IconPushDetail />}
      />
    </Screen>
  );
}

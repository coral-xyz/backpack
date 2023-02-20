import type { ChannelAppUiClient } from "@coral-xyz/common";
import type { Commitment } from "@solana/web3.js";

import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { Screen } from "~components/index";
import {
  EthereumConnectionUrl,
  SolanaCluster,
  SolanaExplorer,
  UI_RPC_METHOD_ETHEREUM_CHAIN_ID_UPDATE,
  UI_RPC_METHOD_ETHEREUM_CONNECTION_URL_UPDATE,
  UI_RPC_METHOD_SOLANA_COMMITMENT_UPDATE,
  UI_RPC_METHOD_SOLANA_CONNECTION_URL_UPDATE,
  UI_RPC_METHOD_SOLANA_EXPLORER_UPDATE,
  walletAddressDisplay,
} from "@coral-xyz/common";
import {
  useBackgroundClient,
  useEthereumConnectionUrl,
  useSolanaCommitment,
  useSolanaConnectionUrl,
  useSolanaExplorer,
} from "@coral-xyz/recoil";
import { useTheme } from "~hooks/useTheme";
import { createStackNavigator } from "@react-navigation/stack";
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
import { ethers } from "ethers";

import { IconCheckmark } from "~components/Icon";
import { AccountDropdownHeader } from "~components/UserAccountsMenu";
const { hexlify } = ethers.utils;

const Stack = createStackNavigator();

function DummyScreen() {
  return <View style={{ flex: 1, backgroundColor: "red" }} />;
}

export function AccountSettingsNavigator(): JSX.Element {
  const theme = useTheme();
  return (
    <Stack.Navigator initialRouteName="Profile">
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: ({ navigation, options }) => (
            <AccountDropdownHeader navigation={navigation} options={options} />
          ),
          headerTintColor: theme.custom.colors.fontColor,
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="YourAccount"
        component={YourAccountScreen}
        options={{
          title: "Your Account",
          headerBackTitle: "Profile",
        }}
      />
      <Stack.Screen
        options={{ title: "Change password" }}
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
        // options={{ title: "Preferences" }}
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
      <Stack.Screen name="reset-warning" component={ResetWarningScreen} />
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
        options={{ title: "Edit Wallets" }}
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
            title: `${name} (${walletAddressDisplay(publicKey)})`,
          };
        }}
      />
      <Stack.Screen
        options={{ title: "Add / Connect Wallet" }}
        name="add-wallet"
        component={AddConnectWalletScreen}
      />
      <Stack.Group
        screenOptions={{ presentation: "modal", headerShown: false }}
      >
        <Stack.Screen name="forgot-password" component={ForgotPasswordScreen} />
        <Stack.Screen name="logout-warning" component={LogoutWarningScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

function PreferencesSolanaCustomRpcUrl({ navigation }) {
  const background = useBackgroundClient();
  const [rpcUrl, setRpcUrl] = useState("");
  const [rpcUrlError, setRpcUrlError] = useState(false);

  const changeNetwork = () => {
    try {
      background
        .request({
          method: UI_RPC_METHOD_SOLANA_CONNECTION_URL_UPDATE,
          params: [rpcUrl],
        })
        .then(close)
        .catch(console.error);
    } catch (err) {
      console.error(err);
    }
  };

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
      detail: currentUrl === SolanaCluster.MAINNET ? <IconCheckmark /> : <></>,
    },
    Devnet: {
      onPress: () => changeNetwork(SolanaCluster.DEVNET),
      detail: currentUrl === SolanaCluster.DEVNET ? <IconCheckmark /> : <></>,
    },
    Localnet: {
      onPress: () => changeNetwork(SolanaCluster.LOCALNET),
      detail: currentUrl === SolanaCluster.LOCALNET ? <IconCheckmark /> : <></>,
    },
    Custom: {
      onPress: () => {
        navigation.push("PreferencesSolanaCustomRpcUrl");
      },
      detail:
        currentUrl !== SolanaCluster.MAINNET &&
        currentUrl !== SolanaCluster.DEVNET &&
        currentUrl !== SolanaCluster.LOCALNET ? (
          <>
            <IconCheckmark />
            <IconPushDetail />
          </>
        ) : (
          <IconPushDetail />
        ),
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
      detail: commitment === "processed" ? <IconCheckmark /> : <></>,
    },
    Confirmed: {
      onPress: () => changeCommitment("confirmed"),
      detail: commitment === "confirmed" ? <IconCheckmark /> : <></>,
    },
    Finalized: {
      onPress: () => changeCommitment("finalized"),
      detail: commitment === "finalized" ? <IconCheckmark /> : <></>,
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
    "Solana Beach": {
      onPress: () => changeExplorer(SolanaExplorer.SOLANA_BEACH),
      detail:
        explorer === SolanaExplorer.SOLANA_BEACH ? <IconCheckmark /> : <></>,
    },
    "Solana Explorer": {
      onPress: () => changeExplorer(SolanaExplorer.SOLANA_EXPLORER),
      detail:
        explorer === SolanaExplorer.SOLANA_EXPLORER ? <IconCheckmark /> : <></>,
    },
    "Solana FM": {
      onPress: () => changeExplorer(SolanaExplorer.SOLANA_FM),
      detail: explorer === SolanaExplorer.SOLANA_FM ? <IconCheckmark /> : <></>,
    },
    Solscan: {
      onPress: () => changeExplorer(SolanaExplorer.SOLSCAN),
      detail: explorer === SolanaExplorer.SOLSCAN ? <IconCheckmark /> : <></>,
    },
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

  return <SettingsList menuItems={menuItems} />;
}

function PreferencesSolana({ route, navigation }) {
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
  const background = useBackgroundClient();
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

  async function onSubmit() {
    await changeNetwork(background, rpcUrl, chainId);
  }

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
        currentUrl === EthereumConnectionUrl.MAINNET ? (
          <IconCheckmark />
        ) : (
          <></>
        ),
    },
    "Görli Testnet": {
      onPress: async () => {
        await changeNetwork(background, EthereumConnectionUrl.GOERLI, "0x5");
        close();
      },
      detail:
        currentUrl === EthereumConnectionUrl.GOERLI ? <IconCheckmark /> : <></>,
    },
    Localnet: {
      onPress: async () => {
        await changeNetwork(background, EthereumConnectionUrl.LOCALNET);
        close();
      },
      detail:
        currentUrl === EthereumConnectionUrl.LOCALNET ? (
          <IconCheckmark />
        ) : (
          <></>
        ),
    },
    Custom: {
      onPress: () => navigation.push("PreferencesEthereumCustomRpcUrl"),
      detail:
        currentUrl !== EthereumConnectionUrl.MAINNET &&
        currentUrl !== EthereumConnectionUrl.GOERLI &&
        currentUrl !== EthereumConnectionUrl.LOCALNET ? (
          <>
            <IconCheckmark /> <IconPushDetail />
          </>
        ) : (
          <IconPushDetail />
        ),
    },
  };

  return <SettingsList menuItems={menuItems} />;
}

function PreferencesEthereum({ route, navigation }) {
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

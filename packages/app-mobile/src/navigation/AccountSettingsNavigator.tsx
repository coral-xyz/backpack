import { Alert, View } from "react-native";
import { Screen } from "@components";
import type { Blockchain, ChannelAppUiClient } from "@coral-xyz/common";
import {
  DerivationPath,
  EthereumConnectionUrl,
  SolanaCluster,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_READ,
  UI_RPC_METHOD_BLOCKCHAINS_ENABLED_ADD,
  UI_RPC_METHOD_BLOCKCHAINS_ENABLED_DELETE,
  UI_RPC_METHOD_ETHEREUM_CHAIN_ID_UPDATE,
  UI_RPC_METHOD_ETHEREUM_CONNECTION_URL_UPDATE,
} from "@coral-xyz/common";
import {
  useBackgroundClient,
  useEnabledBlockchains,
  useEthereumConnectionUrl,
  useKeyringType,
  useSolanaConnectionUrl,
} from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import AccountSettingsScreen from "@screens/Unlocked/Settings/AccountSettingsScreen";
import { SettingsList } from "@screens/Unlocked/Settings/components/SettingsMenuList";
import {
  IconPushDetail,
  SettingsRow,
  SettingsRowSwitch,
} from "@screens/Unlocked/Settings/components/SettingsRow";
import { PreferencesScreen } from "@screens/Unlocked/Settings/PreferencesScreen";
import { PreferencesTrustedSitesScreen } from "@screens/Unlocked/Settings/PreferencesTrustedSitesScreen";
import { ethers } from "ethers";
const { hexlify } = ethers.utils;

const Stack = createStackNavigator();

function IconCheckmark() {
  return <MaterialIcons name="check" size={32} />;
}

function DummyScreen() {
  return <View style={{ flex: 1, backgroundColor: "red" }} />;
}

export default function AccountSettingsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        options={{ title: "Profile" }}
        name="AccountSettingsHome"
        component={AccountSettingsScreen}
      />
      <Stack.Screen
        options={{ title: "Your Account" }}
        name="YourAccount"
        component={DummyScreen}
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
        name="PreferencesSolana"
        component={PreferencesSolana}
      />
      <Stack.Screen
        options={{ title: "Preferences" }}
        name="PreferencesSolanaConnection"
        component={PreferencesSolanaConnection}
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
    </Stack.Navigator>
  );
}

function PreferencesSolanaConnection({ navigation }) {
  const background = useBackgroundClient();
  const currentUrl = useSolanaConnectionUrl();
  const menuItems = {
    "Mainnet (Beta)": {
      onPress: () => changeNetwork(SolanaCluster.MAINNET),
      detail: currentUrl === SolanaCluster.MAINNET ? <Checkmark /> : <></>,
    },
    Devnet: {
      onPress: () => changeNetwork(SolanaCluster.DEVNET),
      detail: currentUrl === SolanaCluster.DEVNET ? <Checkmark /> : <></>,
    },
    Localnet: {
      onPress: () => changeNetwork(SolanaCluster.LOCALNET),
      detail: currentUrl === SolanaCluster.LOCALNET ? <Checkmark /> : <></>,
    },
    Custom: {
      onPress: () => {
        navigation.push("preferences-solana-edit-rpc-connection");
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

function PreferencesSolana({ route, navigation }) {
  const { blockchain } = route.params;

  const menuItems = {
    "RPC Connection": {
      onPress: () => navigation.push("preferences-solana-rpc-connection"),
    },
    "Confirmation Commitment": {
      onPress: () => navigation.push("preferences-solana-commitment"),
    },
    Explorer: {
      onPress: () => navigation.push("preferences-solana-explorer"),
    },
  };

  return (
    <Screen>
      <PreferencesBlockchain blockchain={blockchain} />
      <SettingsList menuItems={menuItems} />;
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
      onPress: () =>
        navigation.push("preferences-ethereum-edit-rpc-connection"),
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
  const { blockchain } = route.params;
  return (
    <Screen>
      <PreferencesBlockchain blockchain={blockchain} />
      <SettingsRow
        label="RPC Connection"
        onPress={() => navigation.push("PreferencesEthereumConnection")}
        detailIcon={<IconPushDetail />}
      />
    </Screen>
  );
}

function PreferencesBlockchain({ blockchain }: { blockchain: Blockchain }) {
  const background = useBackgroundClient();
  const enabledBlockchains = useEnabledBlockchains();
  const keyringType = useKeyringType();
  const isEnabled = enabledBlockchains.includes(blockchain);
  // Can only disable a blockchain if it's *not* the last one remaining.
  const isToggleDisabled = isEnabled && enabledBlockchains.length === 1;

  const openAlert = () => {
    Alert.alert(`Can't toggle the last enabled network`);
  };

  const _onPress = async (isDisabled: boolean) => {
    if (isToggleDisabled) {
      openAlert();
    } else {
      onToggle(isDisabled);
    }
  };

  const onToggle = async (isDisabled: boolean) => {
    if (isDisabled) {
      await background.request({
        method: UI_RPC_METHOD_BLOCKCHAINS_ENABLED_DELETE,
        params: [blockchain],
      });
    } else {
      const blockchainKeyrings = await background.request({
        method: UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_READ,
        params: [],
      });

      if (!blockchainKeyrings.includes(blockchain)) {
        // Blockchain has no keyring initialised, initialise it
        if (keyringType === "ledger") {
          // setOpenDrawer(true);
        } else {
          // Mnemonic based keyring. This is the simple case because we don't
          // need to prompt for the user to open their Ledger app to get the
          // required public key.
          await background.request({
            method: UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
            params: [blockchain, DerivationPath.Default, 0, undefined],
          });
        }
      } else {
        // Keyring exists for blockchain, just enable it
        await background.request({
          method: UI_RPC_METHOD_BLOCKCHAINS_ENABLED_ADD,
          params: [blockchain],
        });
      }
    }
  };

  return (
    <SettingsRowSwitch
      onPress={(value: boolean) => _onPress(value)}
      label="Enable Blockchain"
      value={isEnabled}
    />
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { ProxyImage, Screen } from "@components";
import type { Blockchain, ChannelAppUiClient } from "@coral-xyz/common";
import {
  DerivationPath,
  EthereumConnectionUrl,
  SolanaCluster,
  SolanaExplorer,
  UI_RPC_METHOD_ACTIVE_USER_UPDATE,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_READ,
  UI_RPC_METHOD_BLOCKCHAINS_ENABLED_ADD,
  UI_RPC_METHOD_BLOCKCHAINS_ENABLED_DELETE,
  UI_RPC_METHOD_ETHEREUM_CHAIN_ID_UPDATE,
  UI_RPC_METHOD_ETHEREUM_CONNECTION_URL_UPDATE,
  UI_RPC_METHOD_SOLANA_COMMITMENT_UPDATE,
  UI_RPC_METHOD_SOLANA_CONNECTION_URL_UPDATE,
  UI_RPC_METHOD_SOLANA_EXPLORER_UPDATE,
  walletAddressDisplay,
} from "@coral-xyz/common";
import {
  useAllUsers,
  useAvatarUrl,
  useBackgroundClient,
  useEnabledBlockchains,
  useEthereumConnectionUrl,
  useKeyringType,
  useSolanaCommitment,
  useSolanaConnectionUrl,
  useSolanaExplorer,
  useUser,
} from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import { ImportPrivateKeyScreen } from "@screens/ImportPrivateKeyScreen";
import {
  LogoutWarningScreen,
  ResetWarningScreen,
} from "@screens/ResetWarningScreen";
import { EditWalletDetailScreen } from "@screens/Unlocked/EditWalletDetailScreen";
import { EditWalletsScreen } from "@screens/Unlocked/EditWalletsScreen";
import { ForgotPasswordScreen } from "@screens/Unlocked/ForgotPasswordScreen";
import { RenameWalletScreen } from "@screens/Unlocked/RenameWalletScreen";
import { AddConnectWalletScreen } from "@screens/Unlocked/Settings/AddConnectWalletScreen";
import { ChangePasswordScreen } from "@screens/Unlocked/Settings/ChangePasswordScreen";
import { SettingsList } from "@screens/Unlocked/Settings/components/SettingsMenuList";
import {
  IconPushDetail,
  SettingsRow,
  SettingsRowSwitch,
} from "@screens/Unlocked/Settings/components/SettingsRow";
import { PreferencesScreen } from "@screens/Unlocked/Settings/PreferencesScreen";
import { PreferencesTrustedSitesScreen } from "@screens/Unlocked/Settings/PreferencesTrustedSitesScreen";
import { ProfileScreen } from "@screens/Unlocked/Settings/ProfileScreen";
import {
  ShowPrivateKeyScreen,
  ShowPrivateKeyWarningScreen,
} from "@screens/Unlocked/ShowPrivateKeyScreen";
import {
  ShowRecoveryPhraseScreen,
  ShowRecoveryPhraseWarningScreen,
} from "@screens/Unlocked/ShowRecoveryPhraseScreen";
import { YourAccountScreen } from "@screens/Unlocked/YourAccountScreen";
import type { Commitment } from "@solana/web3.js";
import { ethers } from "ethers";
const { hexlify } = ethers.utils;
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTheme } from "@hooks";

const Stack = createStackNavigator();

function IconCheckmark() {
  return <MaterialIcons name="check" size={32} />;
}

function DummyScreen() {
  return <View style={{ flex: 1, backgroundColor: "red" }} />;
}

const Astyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "grey",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
});

function AccountDropdownHeader(): JSX.Element {
  const user = useUser();
  // const theme = useTheme();

  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // variables
  const snapPoints = useMemo(() => ["25%"], []);

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  return (
    <>
      <View
        style={{
          height: 44,
          backgroundColor: "yellow",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 8,
        }}>
        <Text> h</Text>
        <Pressable
          onPress={handlePresentModalPress}
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}>
          <Text>@49e5e035</Text>
          <Text>@{user.username}</Text>
          <MaterialIcons name="check" size={24} style={{ marginLeft: 4 }} />
        </Pressable>
        <Text> g</Text>
      </View>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}>
        <View style={Astyles.contentContainer}>
          <Text>Awesome 🎉</Text>
        </View>
      </BottomSheetModal>
    </>
  );
}

function UserAccountMenu(): JSX.Element {
  const theme = useTheme();
  return (
    <View
      style={{
        backgroundColor: theme.custom.colors.backgroundBackdrop,
        padding: 16,
      }}>
      <Text
        style={{
          marginTop: 8,
          marginBottom: 16,
          fontSize: 18,
          lineHeight: 24,
          color: theme.custom.colors.fontColor,
        }}>
        Accounts
      </Text>
      <UsersList />
    </View>
  );
}

function UsersList(): JSX.Element {
  const theme = useTheme();
  const users = useAllUsers();
  const _user = useUser();
  return (
    <View
      style={{
        borderColor: theme.custom.colors.borderFull,
        borderRadius: 12,
      }}>
      {users.map(({ username, uuid }: any, idx: number) => (
        <UserAccountListItem
          key={username}
          uuid={uuid}
          isFirst={idx === 0}
          isLast={idx === users.length - 1}
          username={username}
          isActive={_user.username === username}
        />
      ))}
    </View>
  );
}

function UserAccountListItem({
  uuid,
  username,
  isActive,
}: {
  uuid: string;
  username: string;
  isActive: boolean;
}): JSX.Element {
  const theme = useTheme();
  const avatarUrl = useAvatarUrl(24, username);
  const background = useBackgroundClient();
  // const drawer = useDrawerContext();
  return (
    <SettingsRow
      onPress={async () => {
        await background.request({
          method: UI_RPC_METHOD_ACTIVE_USER_UPDATE,
          params: [uuid],
        });
        // drawer.close();
      }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}>
        <View>
          <MiniAvatarIcon avatarUrl={avatarUrl} />
          <Text
            style={{
              marginLeft: 12,
              color: theme.custom.colors.fontColor,
              justifyContent: "center",
            }}>
            @{username}
          </Text>
        </View>
        {isActive && <IconCheckmark />}
      </View>
    </SettingsRow>
  );
}

function MiniAvatarIcon({ avatarUrl }: { avatarUrl: string }) {
  const theme = useTheme();
  // PCA test ProxyImage
  return (
    <View
      style={{
        backgroundColor: theme.custom.colors.avatarIconBackground,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: "center",
      }}>
      <ProxyImage
        src={avatarUrl}
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
        }}
      />
    </View>
  );
}

export default function AccountSettingsNavigator(): JSX.Element {
  const theme = useTheme();
  return (
    <Stack.Navigator
      screenOptions={
        {
          // headerShown: true,
          // headerTintColor: theme.custom.colors.fontColor,
        }
      }>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          header: () => {
            return <AccountDropdownHeader />;
          },
          // headerShown: true,
          // headerTitle: "",
          // headerTransparent: true,
          // headerTintColor: theme.custom.colors.fontColor,
          // headerBackTitle: "Back",
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
        screenOptions={{ presentation: "modal", headerShown: false }}>
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
  //   <div style={{ paddingTop: "16px", height: "100%" }}>
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
  const { blockchain } = route.params;

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
      <PreferencesBlockchain blockchain={blockchain} />
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

  // <div style={{ paddingTop: "16px", height: "100%" }}>
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
  const [error, setError] = useState<string | null>(null);
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
          // required public key. We also don't need a signature to prove
          // ownership of the public key because that can't be done
          // transparently by the backend.
          try {
            await background.request({
              method: UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
              params: [blockchain, DerivationPath.Default, 0],
            });
          } catch (error) {
            setError("Wallet address is used by another Backpack account.");
          }
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
    <>
      <SettingsRowSwitch
        onPress={(value: boolean) => _onPress(value)}
        label="Enable Blockchain"
        value={isEnabled}
      />
      {error}
    </>
  );
}

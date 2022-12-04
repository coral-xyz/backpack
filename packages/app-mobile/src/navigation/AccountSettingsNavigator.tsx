import { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import {
  Header,
  Margin,
  PrimaryButton,
  Screen,
  StyledTextInput,
  SubtextParagraph,
} from "@components";
import type { ChannelAppUiClient } from "@coral-xyz/common";
import {
  Blockchain,
  DerivationPath,
  EthereumConnectionUrl,
  SolanaCluster,
  SolanaExplorer,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_READ,
  UI_RPC_METHOD_BLOCKCHAINS_ENABLED_ADD,
  UI_RPC_METHOD_BLOCKCHAINS_ENABLED_DELETE,
  UI_RPC_METHOD_ETHEREUM_CHAIN_ID_UPDATE,
  UI_RPC_METHOD_ETHEREUM_CONNECTION_URL_UPDATE,
  UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
  UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  UI_RPC_METHOD_SOLANA_COMMITMENT_UPDATE,
  UI_RPC_METHOD_SOLANA_CONNECTION_URL_UPDATE,
  UI_RPC_METHOD_SOLANA_EXPLORER_UPDATE,
} from "@coral-xyz/common";
import type { WalletPublicKeys } from "@coral-xyz/recoil";
import {
  useBackgroundClient,
  useEnabledBlockchains,
  useEthereumConnectionUrl,
  useKeyringType,
  useSolanaCommitment,
  useSolanaConnectionUrl,
  useSolanaExplorer,
  useWalletPublicKeys,
} from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@hooks";
import { useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AccountSettingsScreen from "@screens/Unlocked/Settings/AccountSettingsScreen";
import { AddConnectWalletScreen } from "@screens/Unlocked/Settings/AddConnectWalletScreen";
import { SettingsList } from "@screens/Unlocked/Settings/components/SettingsMenuList";
import {
  IconPushDetail,
  SettingsRow,
  SettingsRowSwitch,
} from "@screens/Unlocked/Settings/components/SettingsRow";
import { PreferencesScreen } from "@screens/Unlocked/Settings/PreferencesScreen";
import { PreferencesTrustedSitesScreen } from "@screens/Unlocked/Settings/PreferencesTrustedSitesScreen";
import type { Commitment } from "@solana/web3.js";
import { Keypair } from "@solana/web3.js";
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
        name="PreferencesEthereumCustomRpcUrl"
        component={PreferencesEthereumCustomRpcUrl}
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
        options={{ title: "Preferences" }}
        name="PreferencesSolanaCommitment"
        component={PreferencesSolanaCommitment}
      />
      <Stack.Screen
        options={{ title: "Preferences" }}
        name="PreferencesSolanaExplorer"
        component={PreferencesSolanaExplorer}
      />
      <Stack.Screen
        options={{ title: "Preferences" }}
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
        options={{ title: "Add / Connect Wallet" }}
        name="AddConnectWallet"
        component={AddConnectWalletScreen}
      />
      <Stack.Screen
        options={{ title: "Waiting Room" }}
        name="WaitingRoom"
        component={DummyScreen}
      />
      <Stack.Screen
        options={{ title: "Import private key" }}
        name="ImportSecretKey"
        component={ImportSecretKeyScreen}
      />
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

export function ImportSecretKeyScreen({
  blockchain,
}: {
  blockchain: Blockchain;
}) {
  const background = useBackgroundClient();
  const existingPublicKeys = useWalletPublicKeys();
  const navigation = useNavigation();
  const theme = useTheme();
  const [name, setName] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [newPublicKey, setNewPublicKey] = useState("");

  useEffect(() => {
    // Clear error on form input changes
    setError(null);
  }, [name, secretKey]);

  const save = async () => {
    let secretKeyHex;
    try {
      secretKeyHex = validateSecretKey(
        blockchain,
        secretKey,
        existingPublicKeys
      );
    } catch (e) {
      setError((e as Error).message);
      return;
    }

    const publicKey = await background.request({
      method: UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
      params: [blockchain, secretKeyHex, name],
    });

    await background.request({
      method: UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
      params: [publicKey, blockchain],
    });

    setNewPublicKey(publicKey);
    setOpenDrawer(true);
  };

  return (
    <Screen style={{ justifyContent: "space-between" }}>
      <View>
        <Header text="Import private key" />
        <Margin bottom={32}>
          <SubtextParagraph>
            Enter your private key. It will be encrypted and stored on your
            device.
          </SubtextParagraph>
        </Margin>
        <Margin bottom={16}>
          <StyledTextInput
            autoFocus={true}
            placeholder="Name"
            value={name}
            onChangeText={(text) => setName(text)}
          />
        </Margin>
        <StyledTextInput
          height={140}
          multiline={true}
          placeholder="Enter private key"
          value={secretKey}
          onChangeText={(text) => {
            setSecretKey(text);
          }}
          // onKeyDown={(e) => {
          //   if (e.key === "Enter") {
          //     save(e);
          //   }
          // }}
          // rows={4}
          // error={error ? true : false}
          // errorMessage={error || ""}
        />
      </View>
      <PrimaryButton
        onPress={() => save()}
        label="Import"
        disabled={secretKey.length === 0}
      />
    </Screen>
  );
}

// <ConfirmCreateWallet
//   blockchain={blockchain}
//   publicKey={newPublicKey}
//   setOpenDrawer={setOpenDrawer}
// />

// <WithMiniDrawer
//   openDrawer={openDrawer}
//   setOpenDrawer={setOpenDrawer}
//   backdropProps={{
//     style: {
//       opacity: 0.8,
//       background: "#18181b",
//     },
//   }}
// >
// </WithMiniDrawer>

// Validate a secret key and return a normalised hex representation
function validateSecretKey(
  blockchain: Blockchain,
  secretKey: string,
  keyring: WalletPublicKeys
): string {
  // Extract public keys from keychain object into array of strings
  const existingPublicKeys = Object.values(keyring[blockchain])
    .map((k) => k.map((i) => i.publicKey))
    .flat();

  if (blockchain === Blockchain.SOLANA) {
    let keypair: Keypair | null = null;
    try {
      // Attempt to create a keypair from JSON secret key
      keypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(secretKey)));
    } catch (_) {
      try {
        // Attempt to create a keypair from bs58 decode of secret key
        keypair = Keypair.fromSecretKey(new Uint8Array(bs58.decode(secretKey)));
      } catch (_) {
        // Failure
        throw new Error("Invalid private key");
      }
    }

    if (existingPublicKeys.includes(keypair.publicKey.toString())) {
      throw new Error("Key already exists");
    }

    return Buffer.from(keypair.secretKey).toString("hex");
  } else if (blockchain === Blockchain.ETHEREUM) {
    try {
      const wallet = new ethers.Wallet(secretKey);

      if (existingPublicKeys.includes(wallet.publicKey)) {
        throw new Error("Key already exists");
      }

      return wallet.privateKey;
    } catch (_) {
      throw new Error("Invalid private key");
    }
  }
  throw new Error("secret key validation not implemented for blockchain");
}

import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";

import { useCallback, useMemo, useRef, useState } from "react";
import { Alert, Text, View } from "react-native";

import {
  BackgroundClient,
  Blockchain,
  getAddMessage,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
  UI_RPC_METHOD_FIND_WALLET_DESCRIPTOR,
  UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
  UI_RPC_METHOD_KEYRING_IMPORT_WALLET,
} from "@coral-xyz/common";
import {
  useActiveWallet,
  useBackgroundClient,
  useEnabledBlockchains,
  useKeyringHasMnemonic,
  useRpcRequests,
  useUser,
  useWalletName,
  useWalletPublicKeys,
} from "@coral-xyz/recoil";
import {
  getIcon,
  LinkButton,
  ListItem,
  PrimaryButton,
  Stack,
  StyledText,
  YStack,
  _ListItemOneLine,
} from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import { BottomSheetModal, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CheckIcon } from "~components/Icon";
import {
  ActionCard,
  Header,
  Margin,
  Screen,
  SubtextParagraph,
  RoundedContainerGroup,
  CurrentUserAvatar,
  BlockchainLogo,
} from "~components/index";
import { useTheme } from "~hooks/useTheme";
import { WalletListItem } from "~screens/Unlocked/EditWalletsScreen";

import { SettingsList } from "./components/SettingsMenuList";
import { IconPushDetail } from "./components/SettingsRow";

import { MnemonicInput } from "~src/components/MnemonicInput";
import { useSession } from "~src/lib/SessionProvider";

export function AddWalletPrivacyDisclaimer({ navigation }): JSX.Element {
  const user = useUser();
  const insets = useSafeAreaInsets();

  return (
    <Screen jc="space-between" style={{ marginBottom: insets.bottom }}>
      <YStack ai="center" space={12}>
        <CurrentUserAvatar size={96} />
        <StyledText textAlign="center" fontSize="$2xl" color="$fontColor">
          Your new wallet will be associated with @{user.username}
        </StyledText>
        <StyledText textAlign="center" color="$secondary">
          This connection will be public, so if you'd prefer to create a
          separate identity, create a new account.
        </StyledText>
      </YStack>
      <YStack>
        <PrimaryButton
          label={`Continue as @${user.username}`}
          onPress={() => {
            navigation.push("AddWalletSelectBlockchain");
          }}
        />
        <LinkButton
          label="Create a new account"
          onPress={() => {
            Alert.alert("Create a new account");
          }}
        />
      </YStack>
    </Screen>
  );
}

export function AddWalletSelectBlockchain({ navigation }): JSX.Element {
  const menuItems = {
    Solana: {
      icon: <BlockchainLogo blockchain={Blockchain.SOLANA} size={24} />,
      onPress: () => {
        navigation.push("AddWalletCreateOrImport", {
          blockchain: Blockchain.SOLANA,
        });
      },
    },
    Ethereum: {
      icon: <BlockchainLogo blockchain={Blockchain.ETHEREUM} size={24} />,
      onPress: () => {
        navigation.push("AddWalletCreateOrImport", {
          blockchain: Blockchain.ETHEREUM,
        });
      },
    },
  };

  return (
    <Screen>
      <SettingsList menuItems={menuItems} />
    </Screen>
  );
}

function CreateNewWalletButton({ blockchain }: { blockchain: Blockchain }) {
  const background = useBackgroundClient();
  const { signMessageForWallet } = useRpcRequests();
  const publicKeys = useWalletPublicKeys();
  const keyringExists = publicKeys[blockchain];

  // If the keyring or if we don't have any public keys of the type we are
  // adding then additional logic is required to select the account index of
  // the first derivation path added
  const hasHdPublicKeys =
    publicKeys?.[blockchain]?.["hdPublicKeys"]?.length > 0;

  const [newPublicKey, setNewPublicKey] = useState("");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [loading, setLoading] = useState(false);

  // Copied from extension/AddConnectWallet/index
  const createNewWithPhrase = async () => {
    // Mnemonic based keyring. This is the simple case because we don't
    // need to prompt for the user to open their Ledger app to get the
    // required public key. We also don't need a signature to prove
    // ownership of the public key because that can't be done
    // transparently by the backend.
    if (loading) {
      return;
    }

    setOpenDrawer(true);
    setLoading(true);

    let newPublicKey;
    if (!keyringExists || !hasHdPublicKeys) {
      // No keyring or no existing mnemonic public keys so can't derive next
      const walletDescriptor = await background.request({
        method: UI_RPC_METHOD_FIND_WALLET_DESCRIPTOR,
        params: [blockchain, 0],
      });

      const signature = await signMessageForWallet(
        blockchain,
        walletDescriptor.publicKey,
        getAddMessage(walletDescriptor.publicKey),
        {
          mnemonic: true,
          signedWalletDescriptors: [
            {
              ...walletDescriptor,
              signature: "",
            },
          ],
        }
      );

      const signedWalletDescriptor = { ...walletDescriptor, signature };
      if (!keyringExists) {
        // Keyring doesn't exist, create it
        await background.request({
          method: UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
          params: [
            {
              mnemonic: true, // Use the existing mnemonic
              signedWalletDescriptors: [signedWalletDescriptor],
            },
          ],
        });
      } else {
        // Keyring exists but the hd keyring is not initialised, import
        await background.request({
          method: UI_RPC_METHOD_KEYRING_IMPORT_WALLET,
          params: [signedWalletDescriptor],
        });
      }

      newPublicKey = walletDescriptor.publicKey;
    } else {
      newPublicKey = await background.request({
        method: UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
        params: [blockchain],
      });
    }

    setNewPublicKey(newPublicKey);
    setLoading(false);
  };

  return (
    <_ListItemOneLine
      loading={loading}
      title="Create a new wallet"
      icon={getIcon("add-circle")}
      iconAfter={<IconPushDetail />}
      onPress={createNewWithPhrase}
    />
  );
}

// {openDrawer ? (
//   <ConfirmCreateWallet blockchain={blockchain} publicKey={newPublicKey} />
// ) : null}

export function AddWalletCreateOrImportScreen({
  navigation,
  route,
}): JSX.Element {
  const { blockchain } = route.params;

  const menuItems = {
    Advanced: {
      label: "Advanced wallet import",
      icon: getIcon("arrow-circle-up"),
      onPress: () => {
        navigation.push("AddWalletAdvancedImport", {
          blockchain,
        });
      },
    },
  };

  return (
    <Screen>
      <SettingsList menuItems={menuItems}>
        <CreateNewWalletButton blockchain={blockchain} />
      </SettingsList>
    </Screen>
  );
}

export function AddWalletAdvancedImportScreen({ navigation, route }) {
  const { blockchain, publicKey } = route.params;
  const enabledBlockchains = useEnabledBlockchains();
  const keyringExists = enabledBlockchains.includes(blockchain);

  const menuItems = {
    "Backpack recovery phrase": {
      onPress: () =>
        navigation.push("ImportFromMnemonic", {
          blockchain,
          keyringExists,
          inputMnemonic: false,
        }),
    },
    "Other recovery phrase": {
      onPress: () =>
        navigation.push("ImportFromMnemonic", {
          blockchain,
          keyringExists,
          inputMnemonic: true,
        }),
    },
    "Private key": {
      onPress: () =>
        navigation.push("ImportPrivateKey", {
          blockchain,
        }),
    },
  };

  return (
    <Screen>
      <SettingsList menuItems={menuItems} />
    </Screen>
  );
}

export function ImportFromMnemonicScreen({ navigation, route }): JSX.Element {
  const insets = useSafeAreaInsets();
  const { blockchain, keyringExists, inputMnemonic } = route.params;
  const [isValid, setIsValid] = useState(false);

  const onComplete = ({
    isValid,
    mnemonic,
  }: {
    isValid: boolean;
    mnemonic: string;
  }) => {
    setIsValid(isValid);
    if (isValid) {
      console.log(mnemonic);
    }
  };

  return (
    <Screen jc="space-between" style={{ marginBottom: insets.bottom }}>
      <YStack f={1}>
        <YStack mb={24}>
          <Header text="Secret Recovery Phrase" />
          <SubtextParagraph>
            Enter your 12 or 24-word secret recovery mnemonic to add an existing
            wallet.
          </SubtextParagraph>
        </YStack>
        <MnemonicInput readOnly={!inputMnemonic} onComplete={onComplete} />
      </YStack>

      <PrimaryButton
        disabled={!isValid}
        label="Next"
        onPress={() => {
          // if (isValid) {
          //   const route =
          //     action === "recover" ? "MnemonicSearch" : "SelectBlockchain";
          //   navigation.push(route);
          // } else {
          //   setError("Invalid secret recovery phrase");
          // }
        }}
      />
    </Screen>
  );
}

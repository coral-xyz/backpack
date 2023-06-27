import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";

import { useCallback, useMemo, useRef, useState } from "react";
import { Alert, Text, View } from "react-native";

import {
  Blockchain,
  UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
} from "@coral-xyz/common";
import {
  useActiveWallet,
  useBackgroundClient,
  useEnabledBlockchains,
  useKeyringHasMnemonic,
  useUser,
  useWalletName,
} from "@coral-xyz/recoil";
import {
  getIcon,
  LinkButton,
  PrimaryButton,
  Stack,
  StyledText,
  YStack,
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

export function AddWalletCreateOrImportScreen({ route }) {
  const user = useUser();
  const { blockchain } = route.params;
  const { setActiveWallet } = useSession();
  // const { blockchain } = useActiveWallet();
  const navigation = useNavigation();
  const background = useBackgroundClient();
  const hasMnemonic = useKeyringHasMnemonic();
  const theme = useTheme();
  const [newPublicKey, setNewPublicKey] = useState(null);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["25%"], []);
  const modalHeight = 240;

  const handleOpenModal = () => bottomSheetModalRef.current?.present();
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior="close"
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

  const menuItems = {
    NewWallet: {
      label: "Create a new wallet",
      icon: getIcon("add-circle"),
      onPress: async () => {
        // could not remove public key error
        const newPubkey = await background.request({
          method: UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
          params: [blockchain],
        });

        console.log("newPubkey", newPubkey);

        handleOpenModal();
      },
    },
    Advanced: {
      label: "Advanced wallet import",
      icon: getIcon("arrow-circle-up"),
      onPress: () => {
        navigation.push("AddWalletAdvancedImport", {
          blockchain: Blockchain.ETHEREUM,
        });
      },
    },
  };

  return (
    <Screen>
      <SettingsList menuItems={menuItems} />
      <BottomSheetModal
        index={0}
        snapPoints={snapPoints}
        ref={bottomSheetModalRef}
        backdropComponent={renderBackdrop}
        contentHeight={modalHeight}
        handleStyle={{
          marginBottom: 12,
        }}
        backgroundStyle={{
          backgroundColor: theme.custom.colors.background,
        }}
      >
        <ConfirmCreateWallet blockchain={blockchain} publicKey={newPublicKey} />
      </BottomSheetModal>
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
        navigation.push("import-from-mnemonic", {
          blockchain,
          keyringExists,
          inputMnemonic: false,
        }),
    },
    "Other recovery phrase": {
      onPress: () =>
        navigation.push("import-from-mnemonic", {
          blockchain,
          inputMnemonic: true,
          keyringExists,
          publicKey,
        }),
    },
    "Private key": {
      onPress: () =>
        navigation.push("import-private-key", {
          blockchain,
          publicKey,
        }),
    },
  };

  return (
    <Screen>
      <SettingsList menuItems={menuItems} />
    </Screen>
  );
}

export const ConfirmCreateWallet = ({
  blockchain,
  publicKey,
}: {
  blockchain: Blockchain;
  publicKey: string;
}): JSX.Element => {
  const theme = useTheme();
  const walletName = useWalletName(publicKey);

  return (
    <View
      style={{
        marginHorizontal: 16,
        backgroundColor: theme.custom.colors.bg2,
      }}
    >
      <View>
        <Text
          style={{
            textAlign: "center",
            fontWeight: "500",
            fontSize: 18,
            color: theme.custom.colors.fontColor,
          }}
        >
          Wallet Created
        </Text>
        <View style={{ alignSelf: "center", marginVertical: 24 }}>
          <CheckIcon />
        </View>
      </View>
      <RoundedContainerGroup>
        <WalletListItem
          blockchain={blockchain}
          publicKey={publicKey}
          name={walletName}
        />
      </RoundedContainerGroup>
    </View>
  );
};

import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Margin, WalletAddress } from "@components";
import type {
  // openPopupWindow,
  Blockchain,
} from "@coral-xyz/common";
import {
  BACKPACK_FEATURE_POP_MODE,
  BACKPACK_FEATURE_XNFT,
  DISCORD_INVITE_LINK,
  UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
  UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
} from "@coral-xyz/common";
// import { Box, Typography, IconButton } from "@mui/material";
// import {
//   ExpandMore,
//   ExpandLess,
//   Add,
//   Lock,
//   AccountCircleOutlined,
//   Tab as WindowIcon,
//   Settings,
//   People,
// } from "@mui/icons-material";
// import { HOVER_OPACITY } from "@coral-xyz/themes";
import {
  useActiveWallets,
  useBackgroundClient,
  useWalletPublicKeys,
  // useBlockchainLogo,
  // useUsername,
  // useAvatarUrl,
  // WalletPublicKeys,
} from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { useBlockchainLogo, useTheme } from "@hooks";
import { useNavigation } from "@react-navigation/native";

import { RoundedContainer, SettingsWalletRow } from "./SettingsRow";

export function WalletLists({ close }: { close: () => void }) {
  const blockchainKeyrings = useWalletPublicKeys();
  return (
    <>
      {Object.entries(blockchainKeyrings).map(([blockchain, keyring]) => (
        <WalletList
          key={blockchain}
          blockchain={blockchain as Blockchain}
          keyring={keyring}
          close={close}
        />
      ))}
    </>
  );
}

export function WalletList({
  blockchain,
  keyring,
  close,
}: {
  blockchain: Blockchain;
  keyring: any;
  close: () => void;
}) {
  const background = useBackgroundClient();
  const activeWallets = useActiveWallets();
  const theme = useTheme();
  const blockchainLogo = useBlockchainLogo(blockchain);
  const [showAll, setShowAll] = useState(false);

  const onPressWallet = (publicKey: string) => {
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
        params: [publicKey, blockchain],
      })
      .then((_resp) => close())
      .catch(console.error);
  };

  let activeWalletType: "derived" | "hardware";

  const keys = keyring.hdPublicKeys
    .map((k: any) => ({ ...k, type: "derived" }))
    .concat(
      keyring.importedPublicKeys.map((k: any) => ({
        ...k,
        type: "imported",
      }))
    )
    .concat(
      keyring.ledgerPublicKeys.map((k: any) => ({ ...k, type: "hardware" }))
    )
    // The drop down should show all wallet keys *except* the active one.
    .filter(({ publicKey, type }: any) => {
      const isActive = activeWallets
        .map((p) => p.publicKey)
        .includes(publicKey);
      if (isActive) {
        activeWalletType = type;
      }
      return !isActive;
    });

  const { name, publicKey } = activeWallets.filter(
    (a) => a.blockchain === blockchain
  )[0];

  return (
    <Margin bottom={12}>
      <RoundedContainer key={publicKey}>
        <SettingsWalletRow
          icon={blockchainLogo}
          name={name}
          publicKey={publicKey}
          onPress={() => {
            Alert.alert("pressed");
            setShowAll(!showAll);
          }}
        />
      </RoundedContainer>
      {showAll ? <AllWallets keys={keys} /> : null}
      {showAll ? <AddConnectWalletButton blockchain={blockchain} /> : null}
    </Margin>
  );
}

function AllWallets({ keys }) {
  return (
    <>
      {keys.map(({ name, publicKey, type }) => {
        return (
          <View key={publicKey.toString()}>
            <Text>{JSON.stringify({ name, publicKey, type }, null, 2)}</Text>
            <WalletAddress
              name={name}
              publicKey={publicKey}
              style={{
                fontWeight: "500",
                lineHeight: 24,
                fontSize: 16,
              }}
              nameStyle={{
                maxWidth: 75,
              }}
            />
          </View>
        );
      })}
    </>
  );
}

export const AddConnectWalletButton = ({
  blockchain,
}: {
  blockchain: Blockchain;
}) => {
  const navigation = useNavigation();
  const theme = useTheme();
  const onPress = (blockchain: Blockchain) => {
    navigation.push("AddConnectWallet", { blockchain });
  };

  return (
    <Pressable
      onPress={() => {
        onPress(blockchain);
      }}
      style={{
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Margin right={12}>
        <MaterialIcons
          name="add"
          size={24}
          color={theme.custom.colors.secondary}
        />
      </Margin>
      <Text
        style={{
          fontSize: 16,
          color: theme.custom.colors.secondary,
        }}
      >
        Add / Connect Wallet
      </Text>
    </Pressable>
  );
};

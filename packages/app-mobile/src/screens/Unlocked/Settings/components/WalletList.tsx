import { Margin } from "@components";
import { View, Text, StyleSheet } from "react-native";
import { useState } from "react";
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
  useBackgroundClient,
  useWalletPublicKeys,
  useActiveWallets,
  // useBlockchainLogo,
  // useUsername,
  // useAvatarUrl,
  // WalletPublicKeys,
} from "@coral-xyz/recoil";
import {
  // openPopupWindow,
  Blockchain,
  BACKPACK_FEATURE_POP_MODE,
  BACKPACK_FEATURE_XNFT,
  UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
  DISCORD_INVITE_LINK,
} from "@coral-xyz/common";
import { useBlockchainLogo, useTheme } from "@hooks";
import { SettingsWalletRow, RoundedContainer } from "./SettingsRow";

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

  const clickWallet = (publicKey: string) => {
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
            setShowAll(!showAll);
          }}
        />
      </RoundedContainer>
    </Margin>
  );
}

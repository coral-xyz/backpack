import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Margin } from "@components";
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
import { UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE } from "@coral-xyz/common";
import { useBlockchainLogo, useTheme } from "@hooks";
import { SettingsWalletRow, RoundedContainer } from "./SettingsRow";
export function WalletLists({ close }) {
  const blockchainKeyrings = useWalletPublicKeys();
  return _jsx(_Fragment, {
    children: Object.entries(blockchainKeyrings).map(([blockchain, keyring]) =>
      _jsx(
        WalletList,
        { blockchain: blockchain, keyring: keyring, close: close },
        blockchain
      )
    ),
  });
}
export function WalletList({ blockchain, keyring, close }) {
  const background = useBackgroundClient();
  const activeWallets = useActiveWallets();
  const theme = useTheme();
  const blockchainLogo = useBlockchainLogo(blockchain);
  const [showAll, setShowAll] = useState(false);
  const clickWallet = (publicKey) => {
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
        params: [publicKey, blockchain],
      })
      .then((_resp) => close())
      .catch(console.error);
  };
  let activeWalletType;
  const keys = keyring.hdPublicKeys
    .map((k) => ({ ...k, type: "derived" }))
    .concat(
      keyring.importedPublicKeys.map((k) => ({
        ...k,
        type: "imported",
      }))
    )
    .concat(keyring.ledgerPublicKeys.map((k) => ({ ...k, type: "hardware" })))
    // The drop down should show all wallet keys *except* the active one.
    .filter(({ publicKey, type }) => {
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
  return _jsx(Margin, {
    bottom: 12,
    children: _jsx(
      RoundedContainer,
      {
        children: _jsx(SettingsWalletRow, {
          icon: blockchainLogo,
          name: name,
          publicKey: publicKey,
          onPress: () => {
            setShowAll(!showAll);
          },
        }),
      },
      publicKey
    ),
  });
}
//# sourceMappingURL=WalletList.js.map

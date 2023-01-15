import React, { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import { UI_RPC_METHOD_KEYNAME_READ } from "@coral-xyz/common";
import { useBackgroundClient, useWalletPublicKeys } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { ContentCopy } from "@mui/icons-material";
import { Typography } from "@mui/material";

import { useNavStack } from "../../../../common/Layout/NavStack";
import { SettingsList } from "../../../../common/Settings/List";
import { WithCopyTooltip } from "../../../../common/WithCopyTooltip";

export const WalletDetail: React.FC<{
  blockchain: Blockchain;
  publicKey: string;
  name: string;
  type: string;
}> = ({ blockchain, publicKey, name, type }) => {
  const nav = useNavStack();
  const theme = useCustomTheme();
  const background = useBackgroundClient();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [walletName, setWalletName] = useState(name);
  const blockchainKeyrings = useWalletPublicKeys();
  const keyring = blockchainKeyrings[blockchain];

  const publicKeyCount = Object.values(keyring).flat().length;

  useEffect(() => {
    (async () => {
      const keyname = await background.request({
        method: UI_RPC_METHOD_KEYNAME_READ,
        params: [publicKey],
      });
      setWalletName(keyname);
      nav.setTitle(keyname);
    })();
  }, []);

  const copyAddress = () => {
    setTooltipOpen(true);
    setTimeout(() => setTooltipOpen(false), 1000);
    navigator.clipboard.writeText(publicKey);
  };

  const menuItems = {
    "Wallet Address": {
      onClick: () => copyAddress(),
      detail: (
        <div style={{ display: "flex" }}>
          <Typography
            style={{ color: theme.custom.colors.secondary, marginRight: "8px" }}
          >
            {publicKey.slice(0, 4) +
              "..." +
              publicKey.slice(publicKey.length - 4)}
          </Typography>
          <ContentCopy
            style={{ width: "20px", color: theme.custom.colors.icon }}
          />
        </div>
      ),
    },
    "Rename Wallet": {
      onClick: () =>
        nav.push("edit-wallets-rename", {
          publicKey,
          name: walletName,
        }),
    },
  };

  const secrets = {
    "Show private key": {
      onClick: () => nav.push("show-private-key-warning", { publicKey }),
    },
  };

  const removeWallet = {
    "Remove Wallet": {
      onClick: () =>
        nav.push("edit-wallets-remove", {
          blockchain,
          publicKey,
          name,
          type,
        }),
      style: {
        color: theme.custom.colors.negative,
      },
    },
  };

  return (
    <div>
      <WithCopyTooltip tooltipOpen={tooltipOpen}>
        <div>
          <SettingsList menuItems={menuItems} />
        </div>
      </WithCopyTooltip>
      {type !== "ledger" && <SettingsList menuItems={secrets} />}
      {publicKeyCount > 1 && <SettingsList menuItems={removeWallet} />}
    </div>
  );
};

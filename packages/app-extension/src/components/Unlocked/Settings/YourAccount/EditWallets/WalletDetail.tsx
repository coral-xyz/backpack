import React, { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import { UI_RPC_METHOD_KEYNAME_READ } from "@coral-xyz/common";
import { useBackgroundClient, useWalletPublicKeys } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { ContentCopy } from "@mui/icons-material";

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

      const addr =
        publicKey.slice(0, 4) + "..." + publicKey.slice(publicKey.length - 4);
      nav.setTitle(`${keyname} (${addr})`);
    })();
  }, []);

  const copyAddress = () => {
    setTooltipOpen(true);
    setTimeout(() => setTooltipOpen(false), 1000);
    navigator.clipboard.writeText(publicKey);
  };

  const menuItems = {
    "Rename Wallet": {
      onClick: () =>
        nav.push("edit-wallets-rename", {
          publicKey,
          name: walletName,
        }),
    },
    "Copy Address": {
      onClick: () => copyAddress(),
      detail: <ContentCopy style={{ color: theme.custom.colors.secondary }} />,
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

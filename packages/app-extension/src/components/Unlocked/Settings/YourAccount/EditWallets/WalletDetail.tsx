import React, { useEffect, useState } from "react";
import { UI_RPC_METHOD_KEYNAME_READ } from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { ContentCopy } from "@mui/icons-material";
import { SettingsList } from "../../../../common/Settings/List";
import { useNavStack } from "../../../../common/Layout/NavStack";
import { WithCopyTooltip } from "../../../../common/WithCopyTooltip";

export const WalletDetail: React.FC<{ publicKey: string; name: string }> = ({
  publicKey,
  name,
}) => {
  const nav = useNavStack();
  const theme = useCustomTheme();
  const background = useBackgroundClient();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [walletName, setWalletName] = useState(name);

  useEffect(() => {
    const addr =
      publicKey.slice(0, 4) + "..." + publicKey.slice(publicKey.length - 4);
    nav.setTitle(`${walletName} (${addr})`);
  }, [nav, walletName]);

  useEffect(() => {
    (async () => {
      const keyname = await background.request({
        method: UI_RPC_METHOD_KEYNAME_READ,
        params: [publicKey],
      });
      setWalletName(keyname);
    })();
  }, [publicKey, background]);

  const copyAddress = () => {
    setTooltipOpen(true);
    setTimeout(() => setTooltipOpen(false), 1000);
    navigator.clipboard.writeText(publicKey);
  };

  const menuItems = {
    "Rename wallet": {
      onClick: () =>
        nav.push("edit-wallets-rename", {
          publicKey,
          name: walletName,
        }),
    },
    "Copy address": {
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
    "Remove wallet": {
      onClick: () => nav.push("edit-wallets-remove"),
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
      <SettingsList menuItems={secrets} />
      <SettingsList menuItems={removeWallet} />
    </div>
  );
};

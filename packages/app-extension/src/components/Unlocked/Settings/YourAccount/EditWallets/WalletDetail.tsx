import React, { useEffect, useState } from "react";
import { useCustomTheme } from "@coral-xyz/themes";
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
  const [tooltipOpen, setTooltipOpen] = useState(false);

  useEffect(() => {
    const addr =
      publicKey.slice(0, 4) + "..." + publicKey.slice(publicKey.length - 4);
    nav.setTitle(`${name} (${addr})`);
  }, [nav]);

  const copyAddress = () => {
    setTooltipOpen(true);
    setTimeout(() => setTooltipOpen(false), 1000);
    navigator.clipboard.writeText(publicKey);
  };

  const menuItems = {
    "Rename wallet": {
      onClick: () => nav.push("edit-wallets-rename"),
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

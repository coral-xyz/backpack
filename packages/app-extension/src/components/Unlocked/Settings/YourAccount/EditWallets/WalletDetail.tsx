import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import {
  Blockchain,
  UI_RPC_METHOD_KEY_IS_COLD_UPDATE,
} from "@coral-xyz/common";
import { UI_RPC_METHOD_KEYNAME_READ } from "@coral-xyz/common";
import {
  isKeyCold,
  useBackgroundClient,
  useWalletPublicKeys,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { ContentCopy } from "@mui/icons-material";
import { Typography } from "@mui/material";

import { useNavStack } from "../../../../common/Layout/NavStack";
import { SettingsList } from "../../../../common/Settings/List";
import { WithCopyTooltip } from "../../../../common/WithCopyTooltip";
import { ModeSwitch } from "../../Preferences";

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
  const publicKeyData = useWalletPublicKeys();
  const isCold = useRecoilValue(isKeyCold(publicKey));

  useEffect(() => {
    (async () => {
      let keyname = "";
      try {
        keyname = await background.request({
          method: UI_RPC_METHOD_KEYNAME_READ,
          params: [publicKey],
        });
      } catch {
        // No wallet name, might be dehydrated
        return;
      }
      setWalletName(keyname);
      nav.setTitle(keyname);
    })();
  }, []);

  const copyAddress = () => {
    setTooltipOpen(true);
    setTimeout(() => setTooltipOpen(false), 1000);
    navigator.clipboard.writeText(publicKey);
  };

  // Account recovery is not possible for private key imports, so prevent
  // removal of wallets if they are the last one in the wallet that can be used
  // for recovery
  const isLastRecoverable =
    Object.values(publicKeyData)
      .map((keyring) => [...keyring.hdPublicKeys, ...keyring.ledgerPublicKeys])
      .flat()
      .filter((n) => n.publicKey !== publicKey).length === 0;

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
    "Show Private Key": {
      onClick: () => nav.push("show-private-key-warning", { publicKey }),
    },
  };

  const recover = {
    Recover: {
      onClick: () =>
        nav.push("add-connect-wallet", {
          blockchain,
          publicKey,
          isRecovery: true,
        }),
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

  const _isCold = {
    "App Signing": {
      onClick: async () => {
        await background.request({
          method: UI_RPC_METHOD_KEY_IS_COLD_UPDATE,
          params: [publicKey, !isCold],
        });
      },
      detail: (
        <ModeSwitch
          enabled={!isCold}
          onSwitch={async (enabled) => {
            await background.request({
              method: UI_RPC_METHOD_KEY_IS_COLD_UPDATE,
              params: [publicKey, enabled],
            });
          }}
        />
      ),
    },
  };

  return (
    <div>
      <WithCopyTooltip tooltipOpen={tooltipOpen}>
        <div>
          <SettingsList menuItems={menuItems} />
        </div>
      </WithCopyTooltip>
      {type !== "dehyrdrated" && <SettingsList menuItems={_isCold} />}
      {type !== "hardware" && type !== "dehydrated" && (
        <SettingsList menuItems={secrets} />
      )}
      {type === "dehydrated" && <SettingsList menuItems={recover} />}
      {!isLastRecoverable && <SettingsList menuItems={removeWallet} />}
    </div>
  );
};

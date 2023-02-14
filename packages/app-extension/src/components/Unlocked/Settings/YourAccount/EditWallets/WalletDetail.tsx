import React, { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  UI_RPC_METHOD_KEY_IS_COLD_UPDATE,
  UI_RPC_METHOD_KEYNAME_READ,
  walletAddressDisplay,
} from "@coral-xyz/common";
import { SecondaryButton, WarningIcon } from "@coral-xyz/react-common";
import {
  isKeyCold,
  useBackgroundClient,
  useWalletPublicKeys,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { ContentCopy } from "@mui/icons-material";
import { Button, Typography } from "@mui/material";
import { useRecoilValue } from "recoil";

import { HeaderIcon } from "../../../../common";
import { useNavigation } from "../../../../common/Layout/NavStack";
import { SettingsList } from "../../../../common/Settings/List";
import { WithCopyTooltip } from "../../../../common/WithCopyTooltip";
import { ModeSwitch } from "../../Preferences";

export const WalletDetail: React.FC<{
  blockchain: Blockchain;
  publicKey: string;
  name: string;
  type: string;
  isActive: boolean;
}> = ({ blockchain, publicKey, name, type }) => {
  const nav = useNavigation();
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
        keyname = walletAddressDisplay(publicKey);
      }
      setWalletName(keyname);
      nav.setOptions({ headerTitle: keyname });
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
          onSwitch={async () => {
            await background.request({
              method: UI_RPC_METHOD_KEY_IS_COLD_UPDATE,
              params: [publicKey, !isCold],
            });
          }}
        />
      ),
    },
  };

  const primaryAccountToggle = {
    "Primary account": {
      onClick: async () => {
        await fetch(`${BACKEND_API_URL}/users/activePubkey`, {
          method: "POST",
          body: JSON.stringify({
            publicKey: publicKey,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
      },
      detail: <Button>Set</Button>,
    },
  };

  return (
    <div>
      {type === "dehydrated" && (
        <div
          style={{
            marginLeft: "16px",
            marginRight: "16px",
            marginBottom: "32px",
          }}
        >
          <HeaderIcon icon={<WarningIcon />} />
          <Typography
            style={{
              color: theme.custom.colors.fontColor,
              fontSize: "20px",
              fontWeight: 500,
              textAlign: "center",
              marginLeft: "28px",
              marginRight: "28px",
              marginBottom: "16px",
            }}
          >
            Some more steps are needed to recover this wallet
          </Typography>
          <SecondaryButton
            label="Recover"
            onClick={() => {
              nav.push("add-connect-wallet", {
                blockchain,
                publicKey,
                isRecovery: true,
              });
            }}
          />
        </div>
      )}
      <WithCopyTooltip tooltipOpen={tooltipOpen}>
        <div>
          <SettingsList menuItems={menuItems} />
        </div>
      </WithCopyTooltip>
      {type !== "dehydrated" && <SettingsList menuItems={_isCold} />}
      <SettingsList menuItems={primaryAccountToggle} />
      {type !== "hardware" && type !== "dehydrated" && (
        <SettingsList menuItems={secrets} />
      )}
      {!isLastRecoverable && <SettingsList menuItems={removeWallet} />}
    </div>
  );
};

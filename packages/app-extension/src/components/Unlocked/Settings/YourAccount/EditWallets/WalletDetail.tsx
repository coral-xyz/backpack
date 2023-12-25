import React, { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  formatWalletAddress,
  UI_RPC_METHOD_KEY_IS_COLD_UPDATE,
  UI_RPC_METHOD_KEYNAME_READ,
} from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { SecondaryButton, WarningIcon } from "@coral-xyz/react-common";
import { useBackgroundClient, useWallet } from "@coral-xyz/recoil";
import { useTheme } from "@coral-xyz/tamagui";
import { ContentCopy } from "@mui/icons-material";
import { Typography } from "@mui/material";

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
  const theme = useTheme();
  const background = useBackgroundClient();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [walletName, setWalletName] = useState(name);
  const { isCold } = useWallet(blockchain, publicKey);
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      let keyname = "";
      try {
        // ph101pp todo
        keyname = await background.request({
          method: UI_RPC_METHOD_KEYNAME_READ,
          params: [publicKey, blockchain],
        });
      } catch {
        // No wallet name, might be dehydrated
        keyname = formatWalletAddress(publicKey);
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

  const menuItems = {
    [t("wallet_address")]: {
      onClick: () => copyAddress(),
      detail: (
        <WithCopyTooltip tooltipOpen={tooltipOpen}>
          <div style={{ display: "flex" }}>
            <Typography
              style={{
                color: theme.baseTextMedEmphasis.val,
                marginRight: "8px",
              }}
            >
              {publicKey.slice(0, 4) +
                "..." +
                publicKey.slice(publicKey.length - 4)}
            </Typography>
            <ContentCopy style={{ width: "20px", color: theme.baseIcon.val }} />
          </div>
        </WithCopyTooltip>
      ),
    },
    [t("rename_wallet")]: {
      onClick: () =>
        nav.push("edit-wallets-rename", {
          publicKey,
          name: walletName,
          blockchain,
        }),
    },
  };

  const secrets = {
    [t("show_private_key")]: {
      onClick: () => nav.push("show-private-key-warning", { publicKey }),
    },
  };

  const removeWallet = {
    [t("remove_wallet")]: {
      onClick: () => {
        nav.push("edit-wallets-remove", {
          blockchain,
          publicKey,
          name,
          type,
        });
      },
      style: {
        color: theme.redText.val,
        opacity: 1,
      },
    },
  };

  const _isCold: React.ComponentProps<typeof SettingsList>["menuItems"] = {
    appSigning: {
      label: t("app_signing"),
      onClick: async () => {
        // ph101pp todo
        await background.request({
          method: UI_RPC_METHOD_KEY_IS_COLD_UPDATE,
          params: [blockchain, publicKey, !isCold],
        });
      },
      detail: (
        <ModeSwitch
          enabled={!isCold}
          onSwitch={async () => {
            // ph101pp todo
            await background.request({
              method: UI_RPC_METHOD_KEY_IS_COLD_UPDATE,
              params: [blockchain, publicKey, !isCold],
            });
          }}
        />
      ),
    },
  };

  return (
    <div>
      {type === "dehydrated" ? (
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
              color: theme.baseTextHighEmphasis.val,
              fontSize: "20px",
              fontWeight: 500,
              textAlign: "center",
              marginLeft: "28px",
              marginRight: "28px",
              marginBottom: "16px",
            }}
          >
            {t("some_more_steps_to_recover")}
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
      ) : null}
      <div>
        <SettingsList menuItems={menuItems} />
      </div>
      {type !== "dehydrated" ? <SettingsList menuItems={_isCold} /> : null}
      {type !== "hardware" && type !== "dehydrated" ? (
        <SettingsList menuItems={secrets} />
      ) : null}
      <SettingsList menuItems={removeWallet} />
    </div>
  );
};

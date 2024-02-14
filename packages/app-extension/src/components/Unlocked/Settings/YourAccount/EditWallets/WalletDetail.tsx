import { useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import { UI_RPC_METHOD_KEY_IS_COLD_UPDATE } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { useBackgroundClient, useWallet } from "@coral-xyz/recoil";
import { useTheme } from "@coral-xyz/tamagui";
import { ContentCopy } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { useNavigation } from "@react-navigation/native";

import { Routes } from "../../../../../refactor/navigation/SettingsNavigator";
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
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const background = useBackgroundClient();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const { isCold } = useWallet(blockchain, publicKey);
  const { t } = useTranslation();

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
        navigation.push(Routes.WalletRenameScreen, {
          publicKey,
          name,
          blockchain,
        }),
    },
  };

  const secrets = {
    [t("show_private_key")]: {
      onClick: () =>
        navigation.push(Routes.WalletPrivateKeyWarningScreen, { publicKey }),
    },
  };

  const removeWallet = {
    [t("remove_wallet")]: {
      onClick: () => {
        navigation.push(Routes.WalletRemoveScreen, {
          blockchain,
          publicKey,
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

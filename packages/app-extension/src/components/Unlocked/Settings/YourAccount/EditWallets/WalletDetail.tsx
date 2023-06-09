import React, { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  formatWalletAddress,
  UI_RPC_METHOD_KEY_IS_COLD_UPDATE,
  UI_RPC_METHOD_KEYNAME_READ,
} from "@coral-xyz/common";
import {
  PrimaryButton,
  SecondaryButton,
  WarningIcon,
} from "@coral-xyz/react-common";
import {
  isKeyCold,
  serverPublicKeys,
  useBackgroundClient,
  usePrimaryWallets,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { ContentCopy } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { useRecoilValue, useSetRecoilState } from "recoil";

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
  const isCold = useRecoilValue(isKeyCold(publicKey));
  const primaryWallets = usePrimaryWallets();
  const setServerPublicKeys = useSetRecoilState(serverPublicKeys);

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

  const isPrimary = primaryWallets.find((x) => x.publicKey === publicKey)
    ? true
    : false;

  const menuItems = {
    "Wallet Address": {
      onClick: () => copyAddress(),
      detail: (
        <WithCopyTooltip tooltipOpen={tooltipOpen}>
          <div style={{ display: "flex" }}>
            <Typography
              style={{
                color: theme.custom.colors.secondary,
                marginRight: "8px",
              }}
            >
              {publicKey.slice(0, 4) +
                "..." +
                publicKey.slice(publicKey.length - 4)}
            </Typography>
            <ContentCopy
              style={{ width: "20px", color: theme.custom.colors.icon }}
            />
          </div>
        </WithCopyTooltip>
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

  const removeWallet = {
    "Remove Wallet": {
      onClick: () => {
        if (!isPrimary) {
          nav.push("edit-wallets-remove", {
            blockchain,
            publicKey,
            name,
            type,
          });
        }
      },
      style: {
        color: theme.custom.colors.negative,
        opacity: isPrimary ? 0.6 : 1,
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
      ) : null}
      <div>
        <SettingsList menuItems={menuItems} />
      </div>
      {type !== "dehydrated" ? <SettingsList menuItems={_isCold} /> : null}
      {type !== "hardware" && type !== "dehydrated" ? (
        <SettingsList menuItems={secrets} />
      ) : null}
      <SettingsList menuItems={removeWallet} />
      <div
        style={{
          padding: "16px",
        }}
      >
        <PrimaryButton
          fullWidth
          label={isPrimary ? "This is your primary wallet" : "Set as primary"}
          disabled={isPrimary || type === "dehydrated"}
          onClick={async () => {
            await fetch(`${BACKEND_API_URL}/users/activePubkey`, {
              method: "POST",
              body: JSON.stringify({
                publicKey: publicKey,
              }),
              headers: {
                "Content-Type": "application/json",
              },
            });
            setServerPublicKeys((current) =>
              current.map((c) => {
                if (c.blockchain !== blockchain) {
                  return c;
                }
                if (c.primary && c.publicKey !== publicKey) {
                  return {
                    ...c,
                    primary: false,
                  };
                }
                if (c.publicKey === publicKey) {
                  return {
                    ...c,
                    primary: true,
                  };
                }
                return c;
              })
            );
          }}
        />
      </div>
    </div>
  );
};

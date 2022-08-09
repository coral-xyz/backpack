import { useEffect, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { AddCircle, ArrowCircleDown } from "@mui/icons-material";
import {
  openConnectHardware,
  UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
  UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET_UPDATE,
} from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import { useActiveWallet, useBackgroundClient } from "@coral-xyz/recoil";
import { ActionCard } from "../../../common/Layout/ActionCard";
import { HardwareWalletIcon, CheckIcon } from "../../../common/Icon";
import { Header, SubtextParagraph } from "../../../common";
import { useNavStack } from "../../../common/Layout/NavStack";
import {
  useDrawerContext,
  WithMiniDrawer,
} from "../../../common/Layout/Drawer";
import { WalletListItem } from "../YourAccount/EditWallets";

export function AddConnectWalletMenu() {
  const { close } = useDrawerContext();
  const nav = useNavStack();
  const background = useBackgroundClient();
  const theme = useCustomTheme();
  const [openDrawer, setOpenDrawer] = useState(false);

  useEffect(() => {
    const prevTitle = nav.title;
    const prevStyle = nav.style;
    const prevContentStyle = nav.contentStyle;
    nav.setStyle({
      backgroundColor: theme.custom.colors.nav,
    });
    nav.setContentStyle({
      backgroundColor: theme.custom.colors.nav,
    });
    nav.setTitle("");
    return () => {
      nav.setStyle(prevStyle);
      nav.setContentStyle(prevContentStyle);
      nav.setTitle(prevTitle);
    };
  }, [nav.setContentStyle]);

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          backgroundColor: theme.custom.colors.nav,
        }}
      >
        <Box sx={{ margin: "24px" }}>
          <Header text="Add or connect a wallet" />
          <SubtextParagraph>Add new wallets to Backpack.</SubtextParagraph>
        </Box>
        <Box sx={{ margin: "0 16px" }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <ActionCard
                icon={<AddCircle />}
                text="Create a new wallet"
                onClick={async () => {
                  const newPubkey = await background.request({
                    method: UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
                    params: [],
                  });

                  await background.request({
                    method: UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET_UPDATE,
                    params: [newPubkey],
                  });

                  setOpenDrawer(true);
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <ActionCard
                icon={<ArrowCircleDown />}
                text="Import an existing wallet"
                onClick={() => nav.push("import-secret-key")}
              />
            </Grid>
            <Grid item xs={6}>
              <ActionCard
                icon={
                  <HardwareWalletIcon
                    fill={theme.custom.colors.fontColor}
                    style={{
                      width: "24px",
                      height: "24px",
                    }}
                  />
                }
                text="Connect a hardware wallet"
                onClick={openConnectHardware}
              />
            </Grid>
          </Grid>
        </Box>
      </div>
      <WithMiniDrawer
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
        backdropProps={{
          style: {
            opacity: 0.8,
            background: "#18181b",
          },
        }}
      >
        <ConfirmCreateWallet />
      </WithMiniDrawer>
    </>
  );
}

const ConfirmCreateWallet = () => {
  const theme = useCustomTheme();
  const { publicKey, name } = useActiveWallet();
  return (
    <div
      style={{
        height: "232px",
        backgroundColor: theme.custom.colors.bg2,
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <Typography
          style={{
            marginTop: "16px",
            textAlign: "center",
            fontWeight: 500,
            fontSize: "18px",
            lineHeight: "24px",
          }}
        >
          Wallet Created
        </Typography>
        <div
          style={{
            textAlign: "center",
            marginTop: "24px",
          }}
        >
          <CheckIcon />
        </div>
      </div>
      <div>
        <WalletListItem
          name={name}
          publicKey={publicKey}
          isFirst={true}
          isLast={true}
        />
      </div>
    </div>
  );
};

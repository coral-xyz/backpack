import { useEffect } from "react";
import { Box, Grid } from "@mui/material";
import { AddCircle, ArrowCircleDown } from "@mui/icons-material";
import {
  openConnectHardware,
  UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
  UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET_UPDATE,
} from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { ActionCard } from "../../Layout/ActionCard";
import { HardwareWalletIcon } from "../../common/Icon";
import { Header, SubtextParagraph } from "../../common";
import { useNavStack } from "../../Layout/NavStack";
import { useDrawerContext } from "../../Layout/Drawer";

export function AddConnectWalletMenu() {
  const { close } = useDrawerContext();
  const nav = useNavStack();
  const background = useBackgroundClient();
  const theme = useCustomTheme();

  useEffect(() => {
    const prevStyle = nav.style;
    const prevContentStyle = nav.contentStyle;
    nav.setStyle({
      backgroundColor: theme.custom.colors.nav,
    });
    nav.setContentStyle({
      backgroundColor: theme.custom.colors.nav,
    });
    return () => {
      nav.setStyle(prevStyle);
      nav.setContentStyle(prevContentStyle);
    };
  }, [nav.setContentStyle]);

  return (
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

                close();
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
                  fill="#fff"
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
  );
}

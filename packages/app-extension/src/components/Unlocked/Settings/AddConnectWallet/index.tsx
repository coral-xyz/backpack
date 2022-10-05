import { useEffect, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { AddCircle, ArrowCircleDown } from "@mui/icons-material";
import {
  Blockchain,
  openConnectHardware,
  TAB_BALANCES,
  UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
  UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET_UPDATE,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
  UI_RPC_METHOD_NAVIGATION_TO_ROOT,
} from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import { useTab, useWalletName, useBackgroundClient } from "@coral-xyz/recoil";
import { ActionCard } from "../../../common/Layout/ActionCard";
import { HardwareWalletIcon, CheckIcon } from "../../../common/Icon";
import { Header, SubtextParagraph } from "../../../common";
import { useNavStack } from "../../../common/Layout/NavStack";
import {
  useDrawerContext,
  WithMiniDrawer,
} from "../../../common/Layout/Drawer";
import { WalletListItem } from "../YourAccount/EditWallets";

export function AddConnectWalletMenu({
  blockchain,
}: {
  blockchain: Blockchain;
}) {
  const nav = useNavStack();
  const background = useBackgroundClient();
  const theme = useCustomTheme();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [newPublicKey, setNewPublicKey] = useState("");

  useEffect(() => {
    const prevTitle = nav.title;
    nav.setTitle("");
    return () => {
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
                icon={
                  <AddCircle
                    style={{
                      color: theme.custom.colors.icon,
                    }}
                  />
                }
                text="Create a new wallet"
                onClick={async () => {
                  const newPubkey = await background.request({
                    method: UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
                    params: [blockchain],
                  });

                  await background.request({
                    method: UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET_UPDATE,
                    params: [newPubkey],
                  });

                  setNewPublicKey(newPubkey);
                  setOpenDrawer(true);
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <ActionCard
                icon={
                  <ArrowCircleDown
                    style={{
                      color: theme.custom.colors.icon,
                    }}
                  />
                }
                text="Import an existing wallet"
                onClick={() => nav.push("import-secret-key", { blockchain })}
              />
            </Grid>
            <Grid item xs={6}>
              <ActionCard
                icon={
                  <HardwareWalletIcon
                    fill={theme.custom.colors.icon}
                    style={{
                      width: "24px",
                      height: "24px",
                    }}
                  />
                }
                text="Connect a hardware wallet"
                onClick={() => {
                  openConnectHardware(blockchain);
                  window.close();
                }}
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
        <ConfirmCreateWallet
          blockchain={blockchain}
          publicKey={newPublicKey}
          setOpenDrawer={setOpenDrawer}
        />
      </WithMiniDrawer>
    </>
  );
}

export const ConfirmCreateWallet: React.FC<{
  blockchain: Blockchain;
  publicKey: string;
  setOpenDrawer: (b: boolean) => void;
}> = ({ blockchain, publicKey, setOpenDrawer }) => {
  const theme = useCustomTheme();
  const walletName = useWalletName(publicKey);
  const background = useBackgroundClient();
  const tab = useTab();
  const { close } = useDrawerContext();
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
            color: theme.custom.colors.fontColor,
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
          blockchain={blockchain}
          name={walletName}
          publicKey={publicKey}
          isFirst={true}
          isLast={true}
          onClick={() => {
            if (tab === TAB_BALANCES) {
              background.request({
                method: UI_RPC_METHOD_NAVIGATION_TO_ROOT,
                params: [],
              });
            } else {
              background.request({
                method: UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
                params: [TAB_BALANCES],
              });
            }
            // Close mini drawer.
            setOpenDrawer(false);
            // Close main drawer.
            close();
          }}
        />
      </div>
    </div>
  );
};

import { useEffect, useState } from "react";
import { Box, Grid, Typography, MenuItem } from "@mui/material";
import { AddCircle, ArrowCircleDown } from "@mui/icons-material";
import {
  Blockchain,
  openConnectHardware,
  BACKPACK_FEATURE_MULTICHAIN,
  TAB_BALANCES,
  UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
  UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET_UPDATE,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
  UI_RPC_METHOD_NAVIGATION_TO_ROOT,
} from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import {
  useTab,
  useActiveWallet,
  useBackgroundClient,
} from "@coral-xyz/recoil";
import { ActionCard } from "../../../common/Layout/ActionCard";
import { HardwareWalletIcon, CheckIcon } from "../../../common/Icon";
import { Header, SubtextParagraph, TextField } from "../../../common";
import { useNavStack } from "../../../common/Layout/NavStack";
import {
  useDrawerContext,
  WithMiniDrawer,
} from "../../../common/Layout/Drawer";
import { WalletListItem } from "../YourAccount/EditWallets";

export function AddConnectWalletMenu() {
  const nav = useNavStack();
  const background = useBackgroundClient();
  const theme = useCustomTheme();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [blockchain, setBlockchain] = useState<Blockchain>(Blockchain.SOLANA);

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

  const blockchainOptions = [
    { value: Blockchain.SOLANA, label: "Solana" },
    { value: Blockchain.ETHEREUM, label: "Ethereum" },
  ];

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
          {BACKPACK_FEATURE_MULTICHAIN && (
            <Box sx={{ marginBottom: "16px" }}>
              <TextField
                label="Blockchain"
                value={blockchain}
                setValue={setBlockchain}
                select={true}
              >
                {blockchainOptions.map((o, idx) => (
                  <MenuItem value={o.value} key={idx}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          )}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <ActionCard
                icon={<AddCircle />}
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

                  setOpenDrawer(true);
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <ActionCard
                icon={<ArrowCircleDown />}
                text="Import an existing wallet"
                onClick={() => nav.push("import-secret-key", { blockchain })}
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
                onClick={() => {
                  openConnectHardware();
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
        <ConfirmCreateWallet setOpenDrawer={setOpenDrawer} />
      </WithMiniDrawer>
    </>
  );
}

export const ConfirmCreateWallet: React.FC<{
  setOpenDrawer: (b: boolean) => void;
}> = ({ setOpenDrawer }) => {
  const theme = useCustomTheme();
  const { publicKey, name } = useActiveWallet();
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
          onClick={() => {
            console.log("ON CLICK HERE WTF", tab, TAB_BALANCES);
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

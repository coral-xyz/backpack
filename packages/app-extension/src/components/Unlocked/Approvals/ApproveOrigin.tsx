import { useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  useAllWalletsPerBlockchain,
  useApproveOrigin,
  useBlockchainActiveWallet,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { ExpandMore } from "@mui/icons-material";
import _CheckIcon from "@mui/icons-material/Check";
import {
  Button,
  List,
  ListItem,
  ListItemIcon,
  Typography,
} from "@mui/material";

import { WalletAddress } from "../../../components/common";
import {
  useDrawerContext,
  WithMiniDrawer,
} from "../../../components/common/Layout/Drawer";
import { WalletList } from "../../common/WalletList";

import { WithApproval } from ".";

const useStyles = styles((theme) => ({
  title: {
    fontWeight: 500,
    fontSize: "24px",
    lineHeight: "32px",
    color: theme.custom.colors.fontColor,
    marginBottom: "24px",
    marginTop: "14px",
    textAlign: "center",
  },
  listDescription: {
    color: theme.custom.colors.secondary,
    fontSize: "14px",
    marginBottom: "8px",
  },
  listRoot: {
    color: theme.custom.colors.fontColor,
    padding: "0",
    borderRadius: "4px",
    fontSize: "14px",
  },
  listItemRoot: {
    alignItems: "start",
    borderRadius: "4px",
    background: theme.custom.colors.nav,
    padding: "8px",
    marginBottom: "1px",
    border: `${theme.custom.colors.borderFull}`,
  },
  listItemIconRoot: {
    minWidth: "inherit",
    height: "20px",
    width: "20px",
    marginRight: "8px",
  },
  warning: {
    color: theme.custom.colors.secondary,
    fontSize: "14px",
    marginTop: "24px",
  },
  link: {
    cursor: "pointer",
    color: theme.custom.colors.secondary,
    textDecoration: "underline",
  },
}));

export function ApproveOrigin({
  origin,
  title,
  blockchain,
  onCompletion,
}: any) {
  const classes = useStyles();
  const approveOrigin = useApproveOrigin();
  const activeWallet = useBlockchainActiveWallet(blockchain);
  const [wallet, setWallet] = useState<{
    publicKey: string;
    name: string;
    blockchain: string;
  }>(activeWallet);

  const onConfirm = async () => {
    await approveOrigin(origin);
    await onCompletion({
      didApprove: true,
      walletPublicKey: wallet.publicKey,
    });
  };

  const onDeny = async () => {
    await onCompletion({
      didApprove: false,
      walletPublicKey: wallet.publicKey,
    });
  };

  return (
    <WithApproval
      origin={origin}
      originTitle={title}
      title={
        <div>
          <WalletSelector
            value={wallet}
            onChange={(wallet) => setWallet(wallet)}
          />
          <div className={classes.title}>Do you want to connect?</div>
        </div>
      }
      wallet={wallet.publicKey.toString()}
      onConfirm={onConfirm}
      onDeny={onDeny}
    >
      <>
        <Typography className={classes.listDescription}>
          This app would like to
        </Typography>
        <List className={classes.listRoot}>
          <ListItem className={classes.listItemRoot}>
            <ListItemIcon className={classes.listItemIconRoot}>
              <CheckIcon />
            </ListItemIcon>
            View wallet balance & activity
          </ListItem>
          <ListItem className={classes.listItemRoot}>
            <ListItemIcon className={classes.listItemIconRoot}>
              <CheckIcon />
            </ListItemIcon>
            Request approval for transactions
          </ListItem>
        </List>
      </>
    </WithApproval>
  );
}

function WalletSelector({
  value,
  onChange,
}: {
  value: { blockchain: string; publicKey: string; name: string };
  onChange: (v: {
    blockchain: string;
    publicKey: string;
    name: string;
  }) => void;
}) {
  const theme = useCustomTheme();
  const [openDrawer, setOpenDrawer] = useState(false);
  return (
    <>
      <div
        style={{
          paddingTop: "10px",
          paddingBottom: "10px",
          display: "flex",
        }}
      >
        <div style={{ flex: 1 }} />
        <Button
          disableRipple
          style={{
            padding: 0,
            textTransform: "none",
            color: theme.custom.colors.fontColor,
            fontSize: "18px",
          }}
          onClick={() => setOpenDrawer(!openDrawer)}
        >
          <WalletAddress
            publicKey={value.publicKey}
            name={value.name}
            nameStyle={{
              color: theme.custom.colors.fontColor,
            }}
          />
          <ExpandMore
            style={{
              color: theme.custom.colors.icon,
            }}
          />
        </Button>
        <div style={{ flex: 1 }} />
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
        <BlockchainWalletList value={value} onChange={onChange} />
      </WithMiniDrawer>
    </>
  );
}

function BlockchainWalletList({
  value,
  onChange,
}: {
  value: { blockchain: string; publicKey: string; name: string };
  onChange: (wallet: {
    blockchain: string;
    publicKey: string;
    name: string;
  }) => void;
}) {
  const theme = useCustomTheme();
  const { close } = useDrawerContext();
  const wallets = useAllWalletsPerBlockchain(value.blockchain as Blockchain);
  return (
    <div
      style={{
        padding: "16px",
        overflow: "hidden",
        background: theme.custom.colors.backgroundBackdrop,
      }}
    >
      <WalletList
        disableIconPadding={true}
        wallets={wallets}
        clickWallet={(v: any) => {
          onChange(v);
          close();
        }}
        style={{
          borderRadius: "10px",
          overflow: "hidden",
          marginLeft: 0,
          marginRight: 0,
        }}
        selectedWalletPublicKey={value.publicKey}
      />
    </div>
  );
}

function CheckIcon() {
  const theme = useCustomTheme();
  return (
    <_CheckIcon
      htmlColor={theme.custom.colors.positive}
      style={{ height: "20px", width: "20px" }}
    />
  );
}

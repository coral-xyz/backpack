import { useState } from "react";
import type {
  Blockchain} from "@coral-xyz/common";
import {
  UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
} from "@coral-xyz/common";
import {
  useAllWalletsPerBlockchain,
  useApproveOrigin,
  useBackgroundClient,
  useBlockchainActiveWallet,
  useBlockchainLogo,
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
  const wallet = activeWallet;

  const onConfirm = async () => {
    await approveOrigin(origin);
    await onCompletion({
      didApprove: true,
    });
  };

  const onDeny = async () => {
    await onCompletion({
      didApprove: false,
    });
  };

  return (
    <WithApproval
      origin={origin}
      originTitle={title}
      title={
        <div>
          <WalletSelector blockchain={blockchain} />
          <div className={classes.title}>Wallet Connect</div>
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

function WalletSelector({ blockchain }: { blockchain: Blockchain }) {
  const background = useBackgroundClient();
  const [openDrawer, setOpenDrawer] = useState(false);
  const activeWallet = useBlockchainActiveWallet(blockchain);
  const onChange = async (w: any) => {
    await background.request({
      method: UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
      params: [w.publicKey.toString(), w.blockchain],
    });
  };

  return (
    <>
      <WalletSelectorButton
        wallet={activeWallet}
        onClick={() => setOpenDrawer(!openDrawer)}
      />
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
        <BlockchainWalletList value={activeWallet} onChange={onChange} />
      </WithMiniDrawer>
    </>
  );
}

function WalletSelectorButton({
  wallet,
  onClick,
}: {
  wallet: { blockchain: string; publicKey: string; name: string };
  onClick: () => void;
}) {
  const theme = useCustomTheme();
  return (
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
        onClick={onClick}
      >
        <WalletAddress
          publicKey={wallet.publicKey}
          name={wallet.name}
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
        paddingBottom: "24px",
        background: theme.custom.colors.backgroundBackdrop,
      }}
    >
      <BlockchainHeader blockchain={value.blockchain as Blockchain} />
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

function BlockchainHeader({ blockchain }: { blockchain: Blockchain }) {
  const networkIcon = useBlockchainLogo(blockchain);
  const theme = useCustomTheme();
  return (
    <div
      style={{
        display: "flex",
        marginBottom: "16px",
      }}
    >
      <div style={{ flex: 1 }} />
      <div
        style={{
          display: "flex",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <img
            src={networkIcon}
            style={{
              width: "20px",
              height: "20px",
              marginRight: "8px",
            }}
          />
        </div>
        <Typography
          style={{
            color: theme.custom.colors.fontColor,
            fontSize: "20px",
          }}
        >
          {blockchain.slice(0, 1).toUpperCase() +
            blockchain.slice(1).toLowerCase()}
        </Typography>
      </div>
      <div style={{ flex: 1 }} />
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

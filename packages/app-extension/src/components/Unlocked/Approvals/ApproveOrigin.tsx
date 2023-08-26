import { useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import { ProxyImage } from "@coral-xyz/react-common";
import {
  useApproveOrigin,
  useAvatarUrl,
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
import { WalletDrawerNavStack } from "../../common/WalletList";

import { displayOriginTitle, OriginConnectable, WithApprovalButtons } from ".";

const useStyles = styles((theme) => ({
  title: {
    fontWeight: 500,
    fontSize: "24px",
    lineHeight: "32px",
    color: theme.custom.colors.fontColor,
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
    padding: "8px",
    marginBottom: "1px",
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
    <div
      style={{
        height: "100%",
        flexDirection: "column",
        display: "flex",
      }}
    >
      <WalletSelector blockchain={blockchain} />
      <div style={{ flex: 1 }}>
        <WithApprovalButtons onConfirm={onConfirm} onDeny={onDeny}>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              marginLeft: "32px",
              marginRight: "32px",
            }}
          >
            <div
              style={{
                marginTop: "24px",
                marginBottom: "16px",
              }}
            >
              <div className={classes.title}>{displayOriginTitle(title)}</div>
              <div className={classes.title}>wants to connect</div>
            </div>
            <OriginConnectable
              origin={origin}
              originTitle={title}
              style={{
                marginBottom: "32px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            />
            <ApproveOriginTable />
          </div>
        </WithApprovalButtons>
      </div>
    </div>
  );
}

function ApproveOriginTable() {
  const classes = useStyles();
  return (
    <div>
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
    </div>
  );
}

function WalletSelector({ blockchain }: { blockchain: Blockchain }) {
  const [openDrawer, setOpenDrawer] = useState(false);
  return (
    <div>
      <WalletSelectorButton
        blockchain={blockchain}
        onClick={() => setOpenDrawer(!openDrawer)}
      />
      <WalletDrawerNavStack
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
        filter={(w: { blockchain: string; name: string; publicKey: string }) =>
          w.blockchain === blockchain
        }
      />
    </div>
  );
}

function WalletSelectorButton({
  blockchain,
  onClick,
}: {
  blockchain: Blockchain;
  onClick: () => void;
}) {
  const theme = useCustomTheme();
  const wallet = useBlockchainActiveWallet(blockchain);

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
        <AvatarWithBlockchainImage
          blockchain={wallet.blockchain as Blockchain}
        />
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

function AvatarWithBlockchainImage(_props: { blockchain: Blockchain }) {
  const avatarUrl = useAvatarUrl(32);
  // TODO: use this blockchain icon here.
  return (
    <ProxyImage
      src={avatarUrl}
      style={{
        width: "32px",
        height: "32px",
        borderRadius: "16px",
        marginRight: "16px",
      }}
    />
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

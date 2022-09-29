import { List, ListItem, ListItemIcon, Typography } from "@mui/material";
import _CheckIcon from "@mui/icons-material/Check";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { useApproveOrigin, useBlockchainActiveWallet } from "@coral-xyz/recoil";
import { WithApproval, displayOriginTitle } from ".";
import { walletAddressDisplay } from "../../../components/common";

const useStyles = styles((theme) => ({
  title: {
    fontWeight: 500,
    fontSize: "24px",
    lineHeight: "32px",
    color: theme.custom.colors.fontColor,
    marginBottom: "24px",
    marginTop: "32px",
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

  const onConfirm = async () => {
    await approveOrigin(origin);
    await onCompletion(true);
  };

  const onDeny = async () => {
    await onCompletion(false);
  };

  const walletTitle = activeWallet.name
    ? activeWallet.name
    : walletAddressDisplay(activeWallet.publicKey);

  return (
    <WithApproval
      origin={origin}
      originTitle={title}
      title={
        <div className={classes.title}>
          {displayOriginTitle(title)} would like to connect to {walletTitle}
        </div>
      }
      wallet={activeWallet.publicKey.toString()}
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
        <Typography className={classes.warning}>
          Only connect to apps you trust.
        </Typography>
      </>
    </WithApproval>
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

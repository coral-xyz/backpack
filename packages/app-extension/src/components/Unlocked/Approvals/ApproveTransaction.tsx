import { useState, useEffect } from "react";
import { Link, List, ListItem, Typography } from "@mui/material";
import _CheckIcon from "@mui/icons-material/Check";
import { UI_RPC_METHOD_SIMULATE } from "@coral-xyz/common";
import { useActiveWallet, useBackgroundClient } from "@coral-xyz/recoil";
import { styles } from "@coral-xyz/themes";
import { WithApproval } from ".";

const useStyles = styles((theme) => ({
  title: {
    fontWeight: 500,
    fontSize: "18px",
    lineHeight: "24px",
    color: theme.custom.colors.fontColor,
    marginBottom: "48px",
    marginTop: "16px",
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
    borderBottom: `1px solid #000`,
    borderRadius: "4px",
    background: theme.custom.colors.nav,
    padding: "8px",
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

export function ApproveTransaction({ origin, title, tx, onCompletion }: any) {
  const classes = useStyles();
  const background = useBackgroundClient();
  const [loading, setLoading] = useState(true);
  const wallet = useActiveWallet();

  console.log(wallet);

  useEffect(() => {
    (async () => {
      console.log(tx);
      const result = await background.request({
        method: UI_RPC_METHOD_SIMULATE,
        params: [tx, wallet.publicKey.toString()],
      });
      console.log(result);
    })();
  }, []);

  const onConfirm = async () => {
    console.log("approved transaction", tx);
    await onCompletion(true);
  };

  const onDeny = async () => {
    await onCompletion(false);
  };

  return (
    <WithApproval
      origin={origin}
      originTitle={title}
      title={<div className={classes.title}>Approve Transaction</div>}
      onConfirm={onConfirm}
      onDeny={onDeny}
    >
      <>
        <Typography className={classes.listDescription}>
          Transaction details
        </Typography>
        <List className={classes.listRoot}>
          <ListItem className={classes.listItemRoot}>Network</ListItem>
          <ListItem className={classes.listItemRoot}>Network Fee</ListItem>
        </List>
        <Link className={classes.link}>Advanced transaction details</Link>
      </>
    </WithApproval>
  );
}

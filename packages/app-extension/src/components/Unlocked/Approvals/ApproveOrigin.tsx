import { Link, List, ListItem, ListItemIcon, Typography } from "@mui/material";
import _CheckIcon from "@mui/icons-material/Check";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { useApproveOrigin } from "@coral-xyz/recoil";
import { WithApproval } from ".";

const useStyles = styles((theme) => ({
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

export function ApproveOrigin({ origin, title, onCompletion }: any) {
  const classes = useStyles();
  const approveOrigin = useApproveOrigin();

  const onConfirm = async () => {
    await approveOrigin(origin);
    await onCompletion(true);
  };

  const onDeny = async () => {
    await onCompletion(false);
  };

  return (
    <WithApproval
      origin={origin}
      originTitle={title}
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
          Only connect to apps you trust.{" "}
          <Link className={classes.link}>Learn more.</Link>
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

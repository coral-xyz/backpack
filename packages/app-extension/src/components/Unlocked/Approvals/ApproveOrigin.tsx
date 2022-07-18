import { useEffect } from "react";
import {
  Link,
  List,
  ListItem,
  ListItemIcon,
  Typography,
  IconButton,
} from "@mui/material";
import _CheckIcon from "@mui/icons-material/Check";
import _CloseIcon from "@mui/icons-material/Close";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { useApproveOrigin, useActiveWallet } from "@coral-xyz/recoil";
import {
  walletAddressDisplay,
  PrimaryButton,
  SecondaryButton,
} from "../../../components/common";

const useStyles = styles((theme) => ({
  title: {
    fontWeight: 500,
    fontSize: "24px",
    lineHeight: "32px",
    color: theme.custom.colors.fontColor,
    marginBottom: "24px",
    textAlign: "center",
  },
  closeButtonIcon: {
    color: theme.custom.colors.secondary,
  },
  contentContainer: {
    margin: "32px 32px 0 32px",
  },
  connectablesContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: "32px",
  },
  connectable: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "50%",
  },
  connectableIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    marginBottom: "4px",
  },
  connectableTitle: {
    color: theme.custom.colors.fontColor,
  },
  connectableDescription: {
    color: theme.custom.colors.secondary,
    fontSize: "14px",
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

export function ApproveOrigin({ origin, title, onCompletion }: any) {
  const classes = useStyles();
  const approveOrigin = useApproveOrigin();
  const activeWallet = useActiveWallet();

  const titleTruncateLength = 15;

  // Pull the title from the request URI and truncate it if above length
  let siteTitle;
  if (title && title.length > titleTruncateLength) {
    siteTitle = title.substr(0, titleTruncateLength) + "...";
  } else if (title) {
    siteTitle = title;
  } else {
    siteTitle = "Website";
  }

  // This uses a Google API for favicon retrieval, do we want to parse the page ourselves?
  const siteIcon = `https://www.google.com/s2/favicons?domain=${origin}&sz=180`;

  const onConnect = async () => {
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
    <>
      <IconButton
        disableRipple
        style={{
          left: 0,
          padding: "16px",
          position: "absolute",
        }}
        onClick={onCompletion}
        size="large"
      >
        <_CloseIcon className={classes.closeButtonIcon} />
      </IconButton>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
        }}
      >
        <div className={classes.contentContainer}>
          <div className={classes.title}>
            {siteTitle} would like to connect to {walletTitle}
          </div>
          <div className={classes.connectablesContainer}>
            <Connectable
              title={siteTitle}
              description={new URL(origin).host}
              icon={siteIcon}
            />
            <Connectable
              title={activeWallet.name}
              description={walletAddressDisplay(activeWallet.publicKey)}
              icon="/coral.png"
            />
          </div>
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
            <Typography className={classes.warning}>
              Only connect to apps you trust.{" "}
              <Link className={classes.link}>Learn more.</Link>
            </Typography>
          </div>
        </div>
        <div
          style={{
            marginLeft: "16px",
            marginRight: "16px",
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div style={{ width: "167.5px" }}>
            <SecondaryButton label="Deny" onClick={onDeny} />
          </div>
          <div style={{ width: "167.5px" }}>
            <PrimaryButton label="Connect" onClick={onConnect} />
          </div>
        </div>
      </div>
    </>
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

function Connectable({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: string;
}) {
  const classes = useStyles();
  return (
    <div className={classes.connectable}>
      <div className={classes.connectableIcon}>
        <img style={{ maxWidth: "100%", maxHeight: "100%" }} src={icon} />
      </div>
      <div className={classes.connectableTitle}>{title}</div>
      <div className={classes.connectableDescription}>{description}</div>
    </div>
  );
}

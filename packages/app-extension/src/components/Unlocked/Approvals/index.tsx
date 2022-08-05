import { IconButton } from "@mui/material";
import _CheckIcon from "@mui/icons-material/Check";
import _CloseIcon from "@mui/icons-material/Close";
import { styles } from "@coral-xyz/themes";
import { useActiveWallet } from "@coral-xyz/recoil";
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
}));

export function WithApproval({
  origin,
  originTitle,
  onConfirm,
  onConfirmLabel = "Connect",
  onDeny,
  children,
}: {
  origin: string;
  originTitle: string;
  onConfirm: () => void;
  onConfirmLabel?: string;
  onDeny: () => void;
  children: React.ReactNode;
}) {
  const classes = useStyles();

  return (
    <>
      <IconButton
        disableRipple
        style={{
          left: 0,
          padding: "16px",
          position: "absolute",
        }}
        onClick={onDeny}
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
          <SiteActiveWalletConnect origin={origin} title={originTitle} />
          {children}
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
            <PrimaryButton label={onConfirmLabel} onClick={onConfirm} />
          </div>
        </div>
      </div>
    </>
  );
}

export function SiteActiveWalletConnect({
  origin,
  title,
}: {
  origin: string;
  title: string;
}) {
  const classes = useStyles();
  const activeWallet = useActiveWallet();

  // TODO this is a naive approach to generating the site title and is prone to abuse,
  // we should replace it with a whitelist or a public repository similar to
  // spl-token-registry

  // Pull the title from the request URI and truncate it if above length
  const titleTruncateLength = 15;
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

  const walletTitle = activeWallet.name
    ? activeWallet.name
    : walletAddressDisplay(activeWallet.publicKey);

  return (
    <>
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
    </>
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

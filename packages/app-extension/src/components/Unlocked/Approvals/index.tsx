import _CheckIcon from "@mui/icons-material/Check";
import _CloseIcon from "@mui/icons-material/Close";
import { styles } from "@coral-xyz/themes";
import { useWalletName, useAvatarUrl } from "@coral-xyz/recoil";
import {
  walletAddressDisplay,
  PrimaryButton,
  SecondaryButton,
} from "../../../components/common";
import { ProxyImage } from "../../common/ProxyImage";

const useStyles = styles((theme) => ({
  contentContainer: {
    margin: "0 16px",
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
  title,
  wallet,
  onConfirm,
  onConfirmLabel = "Connect",
  onDeny,
  children,
}: {
  origin: string;
  originTitle: string;
  title?: React.ReactNode;
  wallet: string;
  onConfirm: () => void;
  onConfirmLabel?: string;
  onDeny: () => void;
  children: React.ReactNode;
}) {
  const classes = useStyles();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <div className={classes.contentContainer}>
        {title}
        <OriginWalletConnectIcons
          wallet={wallet}
          origin={origin}
          originTitle={originTitle}
        />
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
  );
}

export function OriginWalletConnectIcons({
  origin,
  originTitle,
  wallet,
}: {
  origin: string;
  originTitle: string;
  wallet: string;
}) {
  const classes = useStyles();
  const walletName = useWalletName(wallet);
  const avatarUrl = useAvatarUrl(56);

  // This uses a Google API for favicon retrieval, do we want to parse the page ourselves?
  const siteIcon = `https://www.google.com/s2/favicons?domain=${origin}&sz=180`;

  return (
    <div className={classes.connectablesContainer}>
      <Connectable
        title={displayOriginTitle(originTitle)}
        description={new URL(origin).host}
        icon={siteIcon}
      />
      <Connectable
        title={walletName}
        description={walletAddressDisplay(wallet)}
        icon={avatarUrl}
      />
    </div>
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
        <ProxyImage
          style={{ maxWidth: "100%", maxHeight: "100%" }}
          src={icon}
        />
      </div>
      <div className={classes.connectableTitle}>{title}</div>
      <div className={classes.connectableDescription}>{description}</div>
    </div>
  );
}

export function displayOriginTitle(title: string) {
  // TODO this is a naive approach to generating the site title and is prone to abuse,
  // we should replace it with a whitelist or a public repository similar to
  // spl-token-registry

  // Truncate title if above length
  const titleTruncateLength = 15;

  let truncatedTitle;
  if (title && title.length > titleTruncateLength) {
    truncatedTitle = title.substring(0, titleTruncateLength).trim() + "...";
  } else if (title) {
    truncatedTitle = title;
  } else {
    // Default title if no title is provided
    truncatedTitle = "Website";
  }

  return truncatedTitle;
}

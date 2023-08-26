import { UNKNOWN_ICON_SRC } from "@coral-xyz/common";
import {
  PrimaryButton,
  ProxyImage,
  SecondaryButton,
} from "@coral-xyz/react-common";
import { useAvatarUrl, useUser, useWalletName } from "@coral-xyz/recoil";
import { styles } from "@coral-xyz/themes";

import { formatWalletAddress } from "../../../components/common";

const useStyles = styles((theme) => ({
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
  connectableTitle: {
    color: theme.custom.colors.fontColor,
  },
  connectableDescription: {
    color: theme.custom.colors.secondary,
    fontSize: "14px",
    textAlign: "center",
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
  return (
    <WithApprovalButtons
      onConfirm={onConfirm}
      onConfirmLabel={onConfirmLabel}
      onDeny={onDeny}
    >
      <div
        style={{
          margin: "0 16px",
        }}
      >
        {title}
        <OriginWalletConnectIcons
          wallet={wallet}
          origin={origin}
          originTitle={originTitle}
        />
        {children}
      </div>
    </WithApprovalButtons>
  );
}

export function WithApprovalButtons({
  onConfirm,
  onConfirmLabel = "Connect",
  onDeny,
  children,
}: {
  onConfirm: () => void;
  onConfirmLabel?: string;
  onDeny: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      {children}
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
          <PrimaryButton label={onConfirmLabel} onClick={() => onConfirm()} />
        </div>
      </div>
    </div>
  );
}

function OriginWalletConnectIcons({
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
  const { username } = useUser();

  return (
    <div className={classes.connectablesContainer}>
      <OriginConnectable
        kind="medium"
        origin={origin}
        originTitle={originTitle}
      />
      <Connectable
        kind="medium"
        title={username}
        description={`${walletName} (${formatWalletAddress(wallet)})`}
        icon={avatarUrl}
      />
    </div>
  );
}

export function OriginConnectable({
  originTitle,
  origin,
  style,
  kind = "small",
}: {
  origin: string;
  originTitle: string;
  kind?: "small" | "medium";
  style?: React.CSSProperties;
}) {
  // This uses a Google API for favicon retrieval, do we want to parse the page ourselves?
  const siteIcon = `https://www.google.com/s2/favicons?domain=${origin}&sz=180`;
  return (
    <Connectable
      kind={kind}
      style={style}
      title={displayOriginTitle(originTitle)}
      description={new URL(origin).host}
      icon={origin.startsWith("http://localhost") ? UNKNOWN_ICON_SRC : siteIcon}
    />
  );
}

function Connectable({
  title,
  description,
  icon,
  style,
  kind = "small",
}: {
  title: string;
  description: string;
  icon: string;
  kind?: "small" | "medium";
  style?: React.CSSProperties;
}) {
  const classes = useStyles();
  return (
    <div className={classes.connectable} style={style}>
      <div
        className={classes.connectableIcon}
        style={{
          width: kind === "small" ? "56px" : "80px",
          height: kind === "small" ? "56px" : "80px",
          borderRadius: "50%",
          marginBottom: kind === "small" ? "4px" : "8px",
        }}
      >
        <ProxyImage
          style={{
            width: kind === "small" ? "56px" : "80px",
            height: kind === "small" ? "56px" : "80px",
            borderRadius: "50%",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
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

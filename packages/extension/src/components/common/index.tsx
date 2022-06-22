import type { PublicKey } from "@solana/web3.js";
import {
  useTheme,
  Typography,
  Button,
  CircularProgress,
  Checkbox,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";

export * from "./List";
export { TextField } from "@coral-xyz/anchor-ui-renderer";

const useStyles = makeStyles((theme: any) => ({
  sendTo: {
    color: theme.custom.colors.fontColor,
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 500,
  },
  addressBook: {
    fontWeight: 500,
    fontSize: "12px",
    lineHeight: "16px",
    color: theme.custom.colors.interactiveIconsActive,
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    height: "100%",
  },
  loadingIndicator: {
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    color: theme.custom.colors.activeNavButton,
  },
  header: {
    color: theme.custom.colors.fontColor,
    fontSize: "24px",
    fontWeight: 500,
  },
  checkboxContainer: {
    display: "flex",
    marginTop: "8px",
  },
  subtext: {
    color: theme.custom.colors.secondary,
  },
}));

export function WalletAddress({ publicKey, name, style }: any) {
  const theme = useTheme() as any;
  return (
    <Typography style={style}>
      <span style={{ marginRight: "8px" }}>{name}</span>
      <span style={{ color: theme.custom.colors.secondary }}>
        ({walletAddressDisplay(publicKey)})
      </span>
    </Typography>
  );
}

export function walletAddressDisplay(publicKey: PublicKey) {
  const pubkeyStr = publicKey.toString();
  return `${pubkeyStr.slice(0, 4)}...${pubkeyStr.slice(pubkeyStr.length - 4)}`;
}

export function TextFieldLabel({ leftLabel, rightLabel }: any) {
  const classes = useStyles();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginLeft: "24px",
        marginRight: "24px",
        marginBottom: "8px",
      }}
    >
      <Typography className={classes.sendTo}>{leftLabel}</Typography>
      <Typography className={classes.addressBook}>{rightLabel}</Typography>
    </div>
  );
}

export function Loading(props: any) {
  const classes = useStyles();
  return (
    <div className={classes.loadingContainer}>
      <CircularProgress
        className={classes.loadingIndicator}
        style={props.iconStyle}
      />
    </div>
  );
}

export function SubtextParagraph({
  children,
  style,
}: {
  children: any;
  style?: React.CSSProperties;
}) {
  const classes = useStyles();
  return (
    <p className={classes.subtext} style={style}>
      {children}
    </p>
  );
}

export function Header({ text }: { text: string }) {
  const classes = useStyles();
  return <Typography className={classes.header}>{text}</Typography>;
}

export function CheckboxForm({
  checked,
  setChecked,
  label,
}: {
  checked: boolean;
  setChecked: (value: boolean) => void;
  label: string;
}) {
  const classes = useStyles();
  return (
    <div className={classes.checkboxContainer}>
      <Checkbox checked={checked} onChange={() => setChecked(!checked)} />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          marginLeft: "10px",
        }}
      >
        <Typography className={classes.subtext}>{label}</Typography>
      </div>
    </div>
  );
}

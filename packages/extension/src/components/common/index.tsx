import type { PublicKey } from "@solana/web3.js";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Checkbox as _Checkbox,
} from "@mui/material";
import { styles, useCustomTheme } from "@coral-xyz/themes";

export * from "./List";
export { TextField } from "@coral-xyz/anchor-ui-renderer";

const useStyles = styles((theme) => ({
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
  button: {
    width: "100%",
    height: "48px",
    borderRadius: "12px",
    "&.Mui-disabled": {
      opacity: 0.5,
    },
  },
  buttonLabel: {
    color: theme.custom.colors.buttonFontColor,
    weight: 500,
    fontSize: "16px",
    lineHeight: "24px",
    textTransform: "none",
  },
  header: {
    color: theme.custom.colors.fontColor,
    fontSize: "24px",
    fontWeight: 500,
    lineHeight: "32px",
  },
  checkBox: {
    padding: "9px",
    color: theme.custom.colors.primaryButton,
  },
  checkboxContainer: {
    display: "flex",
    marginTop: "8px",
  },
  checkBoxRoot: {
    padding: 0,
  },
  checkBoxChecked: {
    color: `${theme.custom.colors.primaryButton} !important`,
  },
  subtext: {
    color: "#A1A1AA",
    marginTop: "8px",
  },
}));

export function WalletAddress({ publicKey, name, style }: any) {
  const theme = useCustomTheme();
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

export function PrimaryButton({
  buttonLabelStyle,
  label,
  ...buttonProps
}: {
  buttonLabelStyle?: React.CSSProperties;
  label?: string;
} & React.ComponentProps<typeof Button>) {
  const classes = useStyles();
  const theme = useCustomTheme() as any;
  const buttonStyle = Object.assign(
    {
      backgroundColor: theme.custom.colors.primaryButton,
    },
    buttonProps.style
  );
  return (
    <Button
      disableRipple
      disableElevation
      className={classes.button}
      variant="contained"
      {...buttonProps}
      style={buttonStyle}
    >
      <Typography style={buttonLabelStyle} className={classes.buttonLabel}>
        {label}
      </Typography>
    </Button>
  );
}

export function SecondaryButton({
  buttonLabelStyle,
  label,
  ...buttonProps
}: {
  buttonLabelStyle?: React.CSSProperties;
  label?: string;
} & React.ComponentProps<typeof Button>) {
  const theme = useCustomTheme() as any;
  const buttonStyle = Object.assign(
    {
      backgroundColor: theme.custom.colors.secondaryButton,
    },
    buttonProps.style
  );
  return (
    <PrimaryButton
      style={buttonStyle}
      buttonLabelStyle={buttonLabelStyle}
      label={label}
      {...buttonProps}
    />
  );
}

export function DangerButton({
  buttonLabelStyle,
  label,
  ...buttonProps
}: {
  buttonLabelStyle?: React.CSSProperties;
  label?: string;
} & React.ComponentProps<typeof Button>) {
  const theme = useCustomTheme();
  const buttonStyle = Object.assign(
    {
      backgroundColor: theme.custom.colors.dangerButton,
    },
    buttonProps.style
  );
  return (
    <PrimaryButton
      style={buttonStyle}
      buttonLabelStyle={buttonLabelStyle}
      label={label}
      {...buttonProps}
    />
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

export function HeaderIcon({
  icon,
  style,
}: {
  icon: any;
  style?: React.CSSProperties;
}) {
  return (
    <Box
      sx={{
        display: "block",
        height: "56px",
        width: "56px",
        m: "8px auto 16px auto",
      }}
    >
      {icon}
    </Box>
  );
}

export function Checkbox({
  checked,
  setChecked = () => {},
  ...checkboxProps
}: {
  checked: boolean;
  setChecked?: (value: boolean) => void;
} & React.ComponentProps<typeof _Checkbox>) {
  const classes = useStyles();
  return (
    <_Checkbox
      className={classes.checkBox}
      checked={checked}
      onChange={() => setChecked(!checked)}
      classes={{
        checked: classes.checkBoxChecked,
        root: classes.checkBoxRoot,
      }}
      {...checkboxProps}
    />
  );
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
      <Checkbox checked={checked} setChecked={setChecked} sx={{ padding: 0 }} />
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

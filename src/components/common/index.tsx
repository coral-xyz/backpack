import { PublicKey } from "@solana/web3.js";
import {
  makeStyles,
  TextField as MuiTextField,
  Typography,
  Button,
  CircularProgress,
} from "@material-ui/core";

const useStyles = makeStyles((theme: any) => ({
  passwordField: {
    fontSize: "14px",
    lineHeight: "24px",
    fontWeight: 500,
    borderRadius: "12px",
    color: theme.custom.colors.secondary,
    width: "351px",
  },
  passwordFieldContainer: {},
  passwordRoot: {
    marginLeft: "12px",
    marginRight: "12px",
    marginTop: "24px",
    marginBottom: "24px",
    width: "351px",
    "& .MuiOutlinedInput-root": {
      border: `solid 1pt ${theme.custom.colors.border}`,
      backgroundColor: theme.custom.colors.background,
      borderRadius: "12px",
      height: "56px",
      "& fieldset": {
        border: "none",
      },
    },
  },
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
    backgroundColor: theme.custom.colors.onboardButton,
    height: "48px",
    borderRadius: "12px",
  },
  buttonLabel: {
    color: theme.custom.colors.fontColor,
    weight: 500,
    fontSize: "16px",
    lineHeight: "24px",
    textTransform: "none",
  },
}));

export function WalletAddress({
  publicKey,
  name,
}: {
  publicKey: PublicKey;
  name: string;
}) {
  const pubkeyStr = publicKey.toString();
  return (
    <Typography>
      <b style={{ marginRight: "8px" }}>{name}</b>(
      {`${pubkeyStr.slice(0, 4)}...${pubkeyStr.slice(pubkeyStr.length - 4)}`})
    </Typography>
  );
}

export function TextField({
  placeholder,
  type,
  value,
  setValue,
  rootClass,
  endAdornment,
}: any) {
  const classes = useStyles();
  return (
    <MuiTextField
      placeholder={placeholder}
      variant="outlined"
      margin="dense"
      required
      fullWidth
      type={type}
      className={classes.passwordFieldContainer}
      inputProps={{
        className: classes.passwordField,
      }}
      classes={{
        root: `${classes.passwordRoot} ${rootClass ?? ""}`,
      }}
      InputLabelProps={{
        shrink: false,
        style: {
          borderRadius: "12px",
        },
      }}
      InputProps={{
        endAdornment,
      }}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
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

export function OnboardButton({
  style,
  disabled,
  onClick,
  disabledClass,
  label,
}: any) {
  const classes = useStyles();
  return (
    <Button
      disableRipple
      disableElevation
      style={style}
      disabled={disabled}
      className={classes.button}
      variant="contained"
      onClick={onClick}
      classes={{
        disabled: disabledClass,
      }}
    >
      <Typography className={classes.buttonLabel}>{label}</Typography>
    </Button>
  );
}

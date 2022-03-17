import { PublicKey } from "@solana/web3.js";
import {
  makeStyles,
  TextField as MuiTextField,
  Typography,
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
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

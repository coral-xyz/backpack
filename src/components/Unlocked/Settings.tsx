import { makeStyles, TextField, Typography } from "@material-ui/core";
import { useActiveWallet } from "../../context/Wallet";
import { getBackgroundClient } from "../../background/client";
import { UI_RPC_METHOD_KEYNAME_UPDATE } from "../../common";

const useStyles = makeStyles((theme: any) => ({
  walletNameField: {
    textAlign: "center",
    color: theme.custom.colors.fontColor,
  },
  walletAddressLabel: {
    textAlign: "center",
    color: theme.custom.colors.fontColor,
  },
}));

export function Settings() {
  const classes = useStyles();
  const { name, publicKey } = useActiveWallet();
  const editName = (newName: string) => {
    const background = getBackgroundClient();
    background
      .request({
        method: UI_RPC_METHOD_KEYNAME_UPDATE,
        params: [publicKey.toString(), newName],
      })
      .catch(console.error);
  };
  const pubkeyStr = publicKey.toString();
  return (
    <div>
      <TextField
        variant="outlined"
        margin="dense"
        required
        fullWidth
        inputProps={{
          className: classes.walletNameField,
        }}
        InputLabelProps={{
          shrink: false,
        }}
        value={name}
        onChange={(e) => editName(e.target.value)}
      />
      <Typography className={classes.walletAddressLabel}>
        ({`${pubkeyStr.slice(0, 4)}...${pubkeyStr.slice(pubkeyStr.length - 4)}`}
        )
      </Typography>
    </div>
  );
}

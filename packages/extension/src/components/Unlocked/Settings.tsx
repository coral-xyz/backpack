import { useState } from "react";
import {
  makeStyles,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@material-ui/core";
import { getBackgroundClient, useActiveWallet } from "@200ms/recoil";
import {
  UI_RPC_METHOD_KEYNAME_UPDATE,
  UI_RPC_METHOD_PASSWORD_UPDATE,
} from "@200ms/common";
import { WithDrawer } from "../Layout/Drawer";

const useStyles = makeStyles((theme: any) => ({
  walletNameField: {
    textAlign: "center",
    color: theme.custom.colors.fontColor,
  },
  walletAddressLabel: {
    textAlign: "center",
    color: theme.custom.colors.fontColor,
  },
  buttonList: {
    color: theme.custom.colors.fontColor,
  },
  changePasswordContainer: {},
  pwButtonContainer: {
    display: "flex",
  },
  pwButton: {
    color: theme.custom.colors.fontColor,
  },
  passwordError: {
    color: "red",
  },
}));

export function Settings() {
  const classes = useStyles();
  const { name, publicKey } = useActiveWallet();
  const [openDrawer, setOpenDrawer] = useState(false);

  const editName = (newName: string) => {
    const background = getBackgroundClient();
    background
      .request({
        method: UI_RPC_METHOD_KEYNAME_UPDATE,
        params: [publicKey.toString(), newName],
      })
      .catch(console.error);
  };
  const changePassword = () => {
    setOpenDrawer(true);
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
      <List className={classes.buttonList}>
        <ListItem button onClick={changePassword}>
          <ListItemText>Change password</ListItemText>
        </ListItem>
      </List>
      <WithDrawer
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
        skipFooter={true}
      >
        <ChangePassword close={() => setOpenDrawer(false)} />
      </WithDrawer>
    </div>
  );
}

function ChangePassword({ close }: { close: () => void }) {
  const classes = useStyles();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const cancel = () => {
    close();
  };
  const save = () => {
    if (newPassword !== newPassword2) {
      setError(`Passwords don't match`);
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    const background = getBackgroundClient();
    background
      .request({
        method: UI_RPC_METHOD_PASSWORD_UPDATE,
        params: [currentPassword, newPassword],
      })
      .then(() => close())
      .catch((err) => setError(err.toString()));
  };
  return (
    <div className={classes.changePasswordContainer}>
      <div>
        <TextField
          placeholder="Current password"
          type="password"
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
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <TextField
          placeholder="New password"
          type="password"
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
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <TextField
          placeholder="Confirm new password"
          type="password"
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
          value={newPassword2}
          onChange={(e) => setNewPassword2(e.target.value)}
        />
        {error && (
          <Typography className={classes.passwordError}>{error}</Typography>
        )}
      </div>
      <div className={classes.pwButtonContainer}>
        <Button onClick={cancel} className={classes.pwButton}>
          Cancel
        </Button>
        <Button onClick={save} className={classes.pwButton}>
          Save
        </Button>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { TextField, Typography } from "@mui/material";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { UI_RPC_METHOD_SOLANA_CONNECTION_URL_UPDATE } from "@coral-xyz/common";
import { List, ListItem, PrimaryButton } from "../../../../common";
import { useDrawerContext } from "../../../../common/Layout/Drawer";
import { useNavStack } from "../../../../common/Layout/NavStack";

const useStyles = styles((theme) => ({
  textFieldRoot: {
    color: theme.custom.colors.secondary,
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        border: "none",
        color: theme.custom.colors.secondary,
      },
    },
  },
}));

export function PreferenceSolanaCustomRpcUrl() {
  const classes = useStyles();
  const theme = useCustomTheme();
  const { close } = useDrawerContext();
  const nav = useNavStack();
  const background = useBackgroundClient();
  const [rpcUrl, setRpcUrl] = useState("");

  const [rpcUrlError, setRpcUrlError] = useState(false);

  const changeNetwork = () => {
    try {
      background
        .request({
          method: UI_RPC_METHOD_SOLANA_CONNECTION_URL_UPDATE,
          params: [rpcUrl],
        })
        .then(close)
        .catch(console.error);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const title = nav.title;
    nav.setTitle("Change RPC Connection");
    return () => {
      nav.setTitle(title);
    };
  }, []);

  useEffect(() => {
    if (!rpcUrl) {
      setRpcUrlError(false);
      return;
    }
    try {
      new URL(rpcUrl.trim());
      setRpcUrlError(false);
    } catch (e: any) {
      setRpcUrlError(true);
    }
  }, [rpcUrl]);

  return (
    <div style={{ paddingTop: "16px", height: "100%" }}>
      <form
        onSubmit={changeNetwork}
        style={{ display: "flex", height: "100%", flexDirection: "column" }}
      >
        <div style={{ flex: 1, flexGrow: 1 }}>
          <List
            style={{
              border: rpcUrlError
                ? `solid 1pt ${theme.custom.colors.negative}`
                : `${theme.custom.colors.borderFull}`,
              borderRadius: "10px",
            }}
          >
            <ListItem
              isLast
              style={{
                height: "46px",
                padding: "10px",
                borderRadius: "8px",
              }}
              button={false}
            >
              <Typography style={{ width: "80px" }}>RPC</Typography>
              <TextField
                placeholder="RPC URL"
                type="text"
                classes={{
                  root: classes.textFieldRoot,
                }}
                className={classes.textField}
                inputProps={{
                  style: {
                    color: theme.custom.colors.secondary,
                    padding: 0,
                  },
                }}
                value={rpcUrl}
                onChange={(e) => {
                  setRpcUrl(e.target.value);
                }}
              />
            </ListItem>
          </List>
        </div>
        <div style={{ padding: 16 }}>
          <PrimaryButton
            disabled={!rpcUrl || rpcUrlError}
            label="Switch"
            type="submit"
          />
        </div>
      </form>
    </div>
  );
}

import { useEffect, useState } from "react";
import { TextField, Typography } from "@mui/material";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { List, ListItem, PrimaryButton } from "../../../../common";
import { useDrawerContext } from "../../../../common/Layout/Drawer";
import { useNavStack } from "../../../../common/Layout/NavStack";
import { changeNetwork } from "./common";

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

export function PreferenceEthereumCustomRpcUrl() {
  const classes = useStyles();
  const theme = useCustomTheme();
  const { close } = useDrawerContext();
  const nav = useNavStack();
  const background = useBackgroundClient();
  const [rpcUrl, setRpcUrl] = useState("");
  const [chainId, setChainId] = useState("");

  const [rpcUrlError, setRpcUrlError] = useState(false);

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
        onSubmit={async () => {
          await changeNetwork(background, rpcUrl, chainId);
          close();
        }}
        style={{ display: "flex", height: "100%", flexDirection: "column" }}
      >
        <div style={{ flex: 1, flexGrow: 1 }}>
          <List
            style={{
              border: theme.custom.colors.borderFull,
              borderRadius: "10px",
            }}
          >
            <ListItem
              button={false}
              style={{
                height: "44px",
                padding: "10px",
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px",
                border: rpcUrlError
                  ? `solid 1pt ${theme.custom.colors.negative}`
                  : `${theme.custom.colors.borderFull}`,
              }}
            >
              <Typography style={{ width: "80px" }}>RPC</Typography>
              <TextField
                value={rpcUrl}
                onChange={(e) => setRpcUrl(e.target.value)}
                placeholder="RPC URL"
                type="text"
                classes={{
                  root: classes.textFieldRoot,
                }}
                inputProps={{
                  style: {
                    color: theme.custom.colors.secondary,
                    padding: 0,
                  },
                }}
              />
            </ListItem>
            <ListItem
              button={false}
              isLast
              style={{
                height: "44px",
                padding: "10px",
              }}
            >
              <Typography style={{ width: "80px" }}>Chian ID</Typography>
              <TextField
                value={chainId}
                onChange={(e) => setChainId(e.target.value)}
                placeholder="Chain ID"
                type="text"
                classes={{
                  root: classes.textFieldRoot,
                }}
                inputProps={{
                  style: {
                    color: theme.custom.colors.secondary,
                    padding: 0,
                  },
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

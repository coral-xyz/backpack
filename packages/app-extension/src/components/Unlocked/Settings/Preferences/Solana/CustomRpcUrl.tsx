import { useEffect, useState } from "react";
import { TextField, Typography } from "@mui/material";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { UI_RPC_METHOD_SOLANA_CONNECTION_URL_UPDATE } from "@coral-xyz/common";
import { List, ListItem, PrimaryButton } from "../../../../common";
import { useDrawerContext } from "../../../../common/Layout/Drawer";
import { useNavStack } from "../../../../common/Layout/NavStack";
import { Inputs, InputListItem } from "../../../../common/Inputs";

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
  listParent: {
    border: `2px solid black`,
    "&:hover": {
      border: `2px solid red !important`,
    },
    "&:focussed": {
      border: `2px solid yellow !important`,
    },
    borderRadius: "10px",
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
          <Inputs error={rpcUrlError}>
            <InputListItem
              isFirst={true}
              isLast={true}
              button={false}
              title={"RPC"}
              placeholder={"RPC URL"}
              value={rpcUrl}
              onChange={(e) => {
                setRpcUrl(e.target.value);
              }}
            />
          </Inputs>
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

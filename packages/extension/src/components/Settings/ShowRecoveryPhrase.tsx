import { useEffect, useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Box, ListItemIcon } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import WebIcon from "@mui/icons-material/Web";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { useBackgroundClient, useEphemeralNav } from "@coral-xyz/recoil";
import { UI_RPC_METHOD_KEYRING_EXPORT_MNEMONIC } from "@coral-xyz/common";
import { CopyButton, MnemonicInputFields } from "../Account/MnemonicInput";
import {
  DangerButton,
  Header,
  HeaderIcon,
  List,
  ListItem,
  PrimaryButton,
  SubtextParagraph,
  TextField,
} from "../common";
import { EyeIcon, WarningIcon } from "../Icon";

const useStyles = makeStyles((theme: any) => ({
  outlinedFieldRoot: {
    margin: 0,
    width: "100%",
    marginBottom: "12px",
    "& .MuiOutlinedInput-root": {
      border: `solid 2pt ${theme.custom.colors.primaryButton}`,
    },
  },
  mnemonicInputRoot: {
    color: theme.custom.colors.secondary,
    borderRadius: "8px",
    marginTop: "4px",
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#292C33",
      borderRadius: "8px",
      height: "40px",
      "& fieldset": {
        border: "none",
      },
    },
    "& .MuiInputBase-input": {
      color: theme.custom.colors.fontColor,
      backgroundColor: "#292C33",
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: 700,
    },
    "& .MuiInputAdornment-root": {
      color: theme.custom.colors.secondary,
      fontWeight: 500,
    },
    "&:hover": {
      backgroundColor: theme.custom.colors.primary,
    },
  },
}));

export function ShowRecoveryPhrase() {
  const classes = useStyles();
  const background = useBackgroundClient();
  const nav = useEphemeralNav();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    nav.setTitle("Show Recovery Phrase");
  }, []);

  const _next = async () => {
    let mnemonic;
    try {
      mnemonic = await background.request({
        method: UI_RPC_METHOD_KEYRING_EXPORT_MNEMONIC,
        params: [password],
      });
    } catch (e) {
      setError(true);
      return;
    }
    nav.push(<ShowRecoveryPhraseMnemonic mnemonic={mnemonic} />);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ margin: "32px 24px 0 24px" }}>
        <HeaderIcon
          icon={<WarningIcon fill="#E95050" width="40px" height="40px" />}
        />
        <Header text="" style={{ textAlign: "center" }} />
        <Box sx={{ marginTop: "24px" }}>
          <List
            style={{
              margin: "0 8px",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          >
            <ListItem style={{ alignItems: "start", borderColor: "#000" }}>
              <ListItemIcon sx={{ minWidth: "inherit", marginRight: "8px" }}>
                <ChatIcon htmlColor="#EF4444" />
              </ListItemIcon>
              Backpack support will never ask for your secret phrase.
            </ListItem>
            <ListItem style={{ alignItems: "start", borderColor: "#000" }}>
              <ListItemIcon sx={{ minWidth: "inherit", marginRight: "8px" }}>
                <WebIcon htmlColor="#EF4444" />
              </ListItemIcon>
              Never share your secret phrase or enter it into an app or website.
            </ListItem>
            <ListItem style={{ alignItems: "start" }} isLast={true}>
              <ListItemIcon sx={{ minWidth: "inherit", marginRight: "8px" }}>
                <LockOpenIcon htmlColor="#EF4444" />
              </ListItemIcon>
              Anyone with your secret phrase will have complete control of your
              account.
            </ListItem>
          </List>
        </Box>
      </Box>
      <Box
        sx={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
        }}
      >
        <TextField
          inputProps={{ name: "password" }}
          placeholder="Password"
          type="password"
          value={password}
          setValue={setPassword}
          rootClass={classes.outlinedFieldRoot}
        />

        <DangerButton label="Show phrase" onClick={_next} />
      </Box>
    </Box>
  );
}

export function ShowRecoveryPhraseMnemonic({ mnemonic }: { mnemonic: string }) {
  const classes = useStyles();
  const nav = useEphemeralNav();
  const mnemonicWords = mnemonic.split(" ");

  useEffect(() => {
    nav.setTitle("Show Recovery Phrase");
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ margin: "32px 24px 0 24px" }}>
        <HeaderIcon icon={<EyeIcon />} />
        <Header text="Recovery phrase" style={{ textAlign: "center" }} />
        <SubtextParagraph style={{ textAlign: "center" }}>
          {" "}
          Use these {mnemonicWords.length} words to recover your wallet
        </SubtextParagraph>
        <MnemonicInputFields
          mnemonicWords={mnemonicWords}
          rootClass={classes.mnemonicInputRoot}
        />
        <Box sx={{ margin: "12px -8px 0 -8px" }}>
          <CopyButton mnemonic={mnemonic} />
        </Box>
      </Box>
      <Box
        sx={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
        }}
      >
        <PrimaryButton label="Close" onClick={() => nav.toRoot()} />
      </Box>
    </Box>
  );
}

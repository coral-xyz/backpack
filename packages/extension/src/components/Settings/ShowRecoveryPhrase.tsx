import { useEffect, useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Box, List, ListItem, ListItemIcon } from "@mui/material";
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
    "& ::placeholder": {
      color: theme.custom.colors.hamburger,
      opacity: "1 !important",
    },
  },
  mnemonicInputRoot: {
    color: theme.custom.colors.secondary,
    borderRadius: "8px",
    marginTop: "4px",
    "& .MuiOutlinedInput-root": {
      backgroundColor: theme.custom.colors.secondaryButton,
      borderRadius: "8px",
      height: "40px",
      "& fieldset": {
        border: "none",
      },
    },
    "& .MuiInputBase-input": {
      color: theme.custom.colors.fontColor,
      backgroundColor: theme.custom.colors.secondaryButton,
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
  listRoot: {
    color: theme.custom.colors.fontColor,
    padding: "0",
    margin: "0 8px",
    borderRadius: "4px",
    fontSize: "14px",
  },
  listItemRoot: {
    alignItems: "start",
    borderBottom: `1px solid #000`,
    borderRadius: "4px",
    background: theme.custom.colors.secondaryButton,
    padding: "8px",
    height: "56px",
  },
  listItemIconRoot: {
    minWidth: "inherit",
    height: "20px",
    width: "20px",
    marginRight: "8px",
  },
}));

export function ShowRecoveryPhrase() {
  const classes = useStyles();
  const background = useBackgroundClient();
  const nav = useEphemeralNav();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    nav.setTitle("Secret recovery phrase");
  }, []);

  const _next = async () => {
    let mnemonic;
    try {
      mnemonic = await background.request({
        method: UI_RPC_METHOD_KEYRING_EXPORT_MNEMONIC,
        params: [password],
      });
    } catch (e) {
      console.error(e);
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
          style={{ width: "40px", height: "40px", marginBottom: "24px" }}
          icon={<WarningIcon fill="#E95050" width="40px" height="40px" />}
        />
        <Header text="Warning" style={{ textAlign: "center" }} />
        <Box sx={{ marginTop: "24px" }}>
          <List className={classes.listRoot}>
            <ListItem className={classes.listItemRoot}>
              <ListItemIcon className={classes.listItemIconRoot}>
                <ChatIcon
                  htmlColor="#EF4444"
                  style={{
                    height: "20px",
                    width: "20px",
                  }}
                />
              </ListItemIcon>
              Backpack support will never ask for your secret phrase.
            </ListItem>
            <ListItem className={classes.listItemRoot}>
              <ListItemIcon className={classes.listItemIconRoot}>
                <WebIcon
                  htmlColor="#EF4444"
                  style={{
                    height: "20px",
                    width: "20px",
                  }}
                />
              </ListItemIcon>
              Never share your secret phrase or enter it into an app or website.
            </ListItem>
            <ListItem
              className={classes.listItemRoot}
              style={{ borderBottom: "none" }}
            >
              <ListItemIcon className={classes.listItemIconRoot}>
                <LockOpenIcon
                  htmlColor="#EF4444"
                  style={{ height: "20px", width: "20px" }}
                />
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
          autoFocus={true}
          isError={error}
          inputProps={{ name: "password" }}
          placeholder="Password"
          type="password"
          value={password}
          setValue={setPassword}
          rootClass={classes.outlinedFieldRoot}
        />

        <DangerButton
          label="Show phrase"
          onClick={_next}
          disabled={password.length === 0}
        />
      </Box>
    </Box>
  );
}

export function ShowRecoveryPhraseMnemonic({ mnemonic }: { mnemonic: string }) {
  const classes = useStyles();
  const nav = useEphemeralNav();
  const mnemonicWords = mnemonic.split(" ");

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
          icon={<EyeIcon />}
          style={{ width: "40px", height: "40px", marginBottom: "24px" }}
        />
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

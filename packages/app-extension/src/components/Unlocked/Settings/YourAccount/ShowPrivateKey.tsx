import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { UI_RPC_METHOD_KEYRING_EXPORT_SECRET_KEY } from "@coral-xyz/common";
import {
  DangerButton,
  EyeIcon,
  SecondaryButton,
  TextInput,
  WarningIcon,
} from "@coral-xyz/react-common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import ChatIcon from "@mui/icons-material/Chat";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import WebIcon from "@mui/icons-material/Web";
import { Box, List, ListItem, ListItemIcon } from "@mui/material";

import {
  Header,
  HeaderIcon,
  SubtextParagraph,
  TextField,
} from "../../../common";
import { CopyButton } from "../../../common/Account/MnemonicInput";
import { useDrawerContext } from "../../../common/Layout/Drawer";
import { useNavigation } from "../../../common/Layout/NavStack";

const useStyles = styles((theme: any) => ({
  passwordField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        border: `${theme.custom.colors.borderFull}`,
      },
      "&:hover fieldset": {
        border: `solid 2pt ${theme.custom.colors.primaryButton}`,
      },
    },
  },
  privateKeyField: {
    borderRadius: "12px",
    border: theme.custom.colors.borderFull,
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        border: `solid 1pt ${theme.custom.colors.border}`,
      },
      "& textarea": {
        border: "none",
      },
      "&:hover fieldset": {
        border: `solid 1pt ${theme.custom.colors.border}`,
      },
      "&.Mui-focused fieldset": {
        border: `solid 1pt ${theme.custom.colors.border} !important`,
      },
    },
  },
  mnemonicInputRoot: {
    color: theme.custom.colors.secondary,
    borderRadius: "8px",
    marginTop: "4px",
    "& .MuiOutlinedInput-root": {
      backgroundColor: theme.custom.colors.nav,
      borderRadius: "8px",
      height: "40px",
      "& fieldset": {
        border: "none",
      },
    },
    "& .MuiInputBase-input": {
      color: theme.custom.colors.fontColor,
      backgroundColor: theme.custom.colors.nav,
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: 700,
    },
    "& .MuiInputAdornment-root": {
      color: theme.custom.colors.secondary,
      fontWeight: 500,
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
    borderRadius: "4px",
    background: theme.custom.colors.nav,
    padding: "8px",
    height: "56px",
    marginBottom: "1px",
    border: `${theme.custom.colors.borderFull}`,
  },
  listItemIconRoot: {
    minWidth: "inherit",
    height: "20px",
    width: "20px",
    marginRight: "8px",
  },
}));

export function ShowPrivateKeyWarning({ publicKey }: { publicKey: string }) {
  const classes = useStyles();
  const background = useBackgroundClient();
  const nav = useNavigation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const navButton = nav.navButtonRight;
    nav.setOptions({ headerTitle: "Show private key" });
    return () => {
      nav.setOptions({ headerRight: navButton });
    };
  }, []);

  const next = async (e: FormEvent) => {
    e.preventDefault();

    let privateKey;
    try {
      privateKey = await background.request({
        method: UI_RPC_METHOD_KEYRING_EXPORT_SECRET_KEY,
        params: [password, publicKey],
      });
    } catch (e) {
      console.error(e);
      setError(true);
      return;
    }
    nav.push("show-private-key", { privateKey });
  };

  return (
    <form
      noValidate
      onSubmit={next}
      style={{
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
              Backpack support will never ask for your private key.
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
              Never share your private key or enter it into an app or website.
            </ListItem>
            <ListItem className={classes.listItemRoot}>
              <ListItemIcon className={classes.listItemIconRoot}>
                <LockOpenIcon
                  htmlColor="#EF4444"
                  style={{ height: "20px", width: "20px" }}
                />
              </ListItemIcon>
              Anyone with your private key will have complete control of your
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
        <Box sx={{ marginBottom: "8px" }}>
          <TextInput
            autoFocus
            error={error}
            placeholder="Password"
            inputProps={{ name: "password" }}
            value={password}
            type="password"
            setValue={(e) => setPassword(e.target.value)}
          />
        </Box>
        <DangerButton
          label="Show private key"
          type="submit"
          disabled={password.length === 0}
        />
      </Box>
    </form>
  );
}

export function ShowPrivateKey({ privateKey }: { privateKey: string }) {
  const theme = useCustomTheme();
  const classes = useStyles();
  const { close } = useDrawerContext();
  const nav = useNavigation();

  useEffect(() => {
    nav.setOptions({ headerTitle: "Private key" });
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
      <Box>
        <Box sx={{ margin: "32px 24px 0 24px" }}>
          <HeaderIcon
            icon={<EyeIcon />}
            style={{ width: "40px", height: "40px", marginBottom: "24px" }}
          />
          <Header text="Private key" style={{ textAlign: "center" }} />
          <SubtextParagraph style={{ textAlign: "center", fontSize: "14px" }}>
            Never give out your private key
          </SubtextParagraph>
        </Box>
        <Box sx={{ margin: "0 16px" }}>
          <TextField
            rows={3}
            readOnly
            value={privateKey}
            rootClass={classes.privateKeyField}
          />
          <Box sx={{ marginTop: "4px" }}>
            <CopyButton
              text={privateKey}
              icon={
                <ContentCopyIcon
                  style={{ color: theme.custom.colors.fontColor }}
                />
              }
              style={{
                height: "50px",
                border: theme.custom.colors.borderFull,
              }}
            />
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
        }}
      >
        <SecondaryButton
          label="Close"
          onClick={() => close()}
          style={{
            border: theme.custom.colors.borderFull,
            height: "50px",
          }}
        />
      </Box>
    </Box>
  );
}

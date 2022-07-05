import { useEffect, useState } from "react";
import { Box, ListItemIcon } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import WebIcon from "@mui/icons-material/Web";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { useBackgroundClient, useEphemeralNav } from "@coral-xyz/recoil";
import {
  Header,
  HeaderIcon,
  TextField,
  DangerButton,
  List,
  ListItem,
} from "../../common";
import { WarningIcon } from "../../Icon";

const useStyles = styles((theme) => ({
  outlinedFieldRoot: {
    margin: 0,
    width: "100%",
    marginBottom: "12px",
    "& .MuiOutlinedInput-root": {
      border: `solid 2pt ${theme.custom.colors.primaryButton}`,
    },
  },
}));

export function ShowRecoveryPhraseWarning({ onNext }: { onNext: () => void }) {
  const classes = useStyles();
  // const background = useBackgroundClient();
  const nav = useEphemeralNav();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const prevNavButton = nav.navButtonRight;
    const prevTitle = nav.title;
    nav.setNavButtonRight(null);
    nav.setTitle("Show Recovery Phrase");
    return () => {
      nav.setNavButtonRight(prevNavButton);
      nav.setTitle(prevTitle);
    };
  }, []);

  const _next = () => {
    /**
    const valid = background.request({
      method: UI_RPC_METHOD_KEYRING_STORE_CHECK_PASSWORD,
      params: [password],
    });
    if (!valid) {
      setError(true);
    } else {
      onNext();
    }
    **/
    onNext();
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
        <Header text="Warning" style={{ textAlign: "center" }} />
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

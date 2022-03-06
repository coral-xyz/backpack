import { useState } from "react";
import {
  useTheme,
  makeStyles,
  Typography,
  IconButton,
  List,
  ListItem,
} from "@material-ui/core";
import { Menu, Close, Lock, Help } from "@material-ui/icons";
import Sidebar from "react-sidebar";
import { UI_RPC_METHOD_KEYRING_STORE_LOCK } from "../../common";
import { getBackgroundClient } from "../../background/client";

const useStyles = makeStyles((theme: any) => ({
  menuButtonContainer: {
    width: "38px",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    position: "relative",
  },
  menuButton: {
    padding: 0,
  },
  menuButtonIcon: {
    color: theme.custom.colors.offText,
  },
  sidebarContentListItem: {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: "5px",
    paddingBottom: "5px",
  },
}));

export function SidebarButton() {
  const classes = useStyles();
  const theme = useTheme() as any;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className={classes.menuButtonContainer}>
      <Sidebar
        sidebar={<SidebarContent close={() => setSidebarOpen(false)} />}
        open={sidebarOpen}
        onSetOpen={setSidebarOpen}
        styles={{
          sidebar: {
            width: "269px",
            position: "fixed",
            backgroundColor: theme.custom.colors.background,
          },
        }}
      >
        <IconButton
          disableRipple
          className={classes.menuButton}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className={classes.menuButtonIcon} />
        </IconButton>
      </Sidebar>
    </div>
  );
}

function SidebarContent({ close }: { close: () => void }) {
  const classes = useStyles();
  const theme = useTheme() as any;
  const lockWallet = () => {
    const background = getBackgroundClient();
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
        params: [],
      })
      .catch(console.error)
      .then(() => close());
  };
  return (
    <div>
      <SidebarHeader close={close} />
      <List
        style={{
          color: theme.custom.colors.fontColor,
          paddingLeft: "16px",
          paddingRight: "16px",
        }}
      >
        <ListItem button className={classes.sidebarContentListItem}>
          <Help
            style={{ color: theme.custom.colors.offText, marginRight: "12px" }}
          />
          <Typography>Help & Support</Typography>
        </ListItem>
        <ListItem
          button
          className={classes.sidebarContentListItem}
          onClick={() => lockWallet()}
        >
          <Lock
            style={{ color: theme.custom.colors.offText, marginRight: "12px" }}
          />
          <Typography>Lock Wallet</Typography>
        </ListItem>
      </List>
    </div>
  );
}

function SidebarHeader({ close }: { close: () => void }) {
  const theme = useTheme() as any;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        height: "46px",
        borderBottom: `solid 1pt ${theme.custom.colors.offText}`,
        paddingLeft: "16px",
        paddingRight: "16px",
        paddingTop: "10px",
        paddingBottom: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Typography
          style={{
            color: theme.custom.colors.fontColor,
            fontWeight: "bold",
          }}
        >
          200ms
        </Typography>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <IconButton onClick={close} style={{ padding: 0 }}>
          <Close style={{ color: theme.custom.colors.offText }} />
        </IconButton>
      </div>
    </div>
  );
}

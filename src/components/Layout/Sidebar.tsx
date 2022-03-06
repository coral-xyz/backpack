import { useState } from "react";
import {
  useTheme,
  makeStyles,
  Typography,
  IconButton,
  List,
  ListItem,
  Drawer,
  Button,
  Divider,
} from "@material-ui/core";
import { Add, Menu, Close, Lock, Help, FlashOn } from "@material-ui/icons";
import Sidebar from "react-sidebar";
import {
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  EXTENSION_HEIGHT,
} from "../../common";
import { getBackgroundClient } from "../../background/client";
import { NAV_BAR_HEIGHT } from "./Nav";
import { useKeyringStoreStateContext } from "../../context/KeyringStoreState";
import { KeyringStoreStateEnum } from "../../keyring/store";

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
  withDrawer: {
    height: EXTENSION_HEIGHT - NAV_BAR_HEIGHT,
    backgroundColor: theme.custom.colors.background,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },
  withDrawerContent: {
    flex: 1,
  },
  drawerRoot: {
    top: `${NAV_BAR_HEIGHT}px !important`,
    zIndex: "1 !important" as any,
  },
  closeDrawerButton: {
    backgroundColor: theme.custom.colors,
    width: "100%",
  },
  sidebarDivider: {
    marginTop: "8px",
    marginBottom: "8px",
    backgroundColor: theme.custom.colors.offText,
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
  const { keyringStoreState } = useKeyringStoreStateContext();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [drawerView, setDrawerView] = useState("recent-activity");
  const _setOpenRecentActivity = (openDrawer: boolean) => {
    setDrawerView("recent-activity");
    setOpenDrawer(openDrawer);
  };
  const _setOpenAddConnect = (openDrawer: boolean) => {
    setDrawerView("add-connect");
    setOpenDrawer(openDrawer);
  };
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
        {keyringStoreState === KeyringStoreStateEnum.Unlocked && (
          <>
            <ListItem
              button
              className={classes.sidebarContentListItem}
              onClick={() => {
                close();
                _setOpenAddConnect(true);
              }}
            >
              <Add
                style={{
                  color: theme.custom.colors.offText,
                  marginRight: "12px",
                }}
              />
              <Typography>Add / Connect Wallet</Typography>
            </ListItem>
            <Divider className={classes.sidebarDivider} />
            <ListItem
              button
              className={classes.sidebarContentListItem}
              onClick={() => {
                close();
                _setOpenRecentActivity(true);
              }}
            >
              <FlashOn
                style={{
                  color: theme.custom.colors.offText,
                  marginRight: "12px",
                }}
              />
              <Typography>Recent Activity</Typography>
            </ListItem>
          </>
        )}
        <ListItem button className={classes.sidebarContentListItem}>
          <Help
            style={{ color: theme.custom.colors.offText, marginRight: "12px" }}
          />
          <Typography>Help & Support</Typography>
        </ListItem>
        {keyringStoreState === KeyringStoreStateEnum.Unlocked && (
          <ListItem
            button
            className={classes.sidebarContentListItem}
            onClick={() => lockWallet()}
          >
            <Lock
              style={{
                color: theme.custom.colors.offText,
                marginRight: "12px",
              }}
            />
            <Typography>Lock Wallet</Typography>
          </ListItem>
        )}
      </List>
      <WithDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
        {drawerView === "recent-activity" && <RecentActivity />}
        {drawerView === "add-connect" && <AddConnectWallet />}
      </WithDrawer>
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

function WithDrawer(props: any) {
  const { children, openDrawer, setOpenDrawer } = props;
  const classes = useStyles();
  return (
    <Drawer
      BackdropProps={{
        style: {
          position: "absolute",
          top: NAV_BAR_HEIGHT,
          height: EXTENSION_HEIGHT - NAV_BAR_HEIGHT,
        },
      }}
      anchor={"bottom"}
      open={openDrawer}
      onClose={() => setOpenDrawer(false)}
      classes={{
        root: classes.drawerRoot,
      }}
    >
      <div className={classes.withDrawer}>
        <div className={classes.withDrawerContent}>{children}</div>
        <Button
          onClick={() => setOpenDrawer(false)}
          variant="contained"
          className={classes.closeDrawerButton}
        >
          Close
        </Button>
      </div>
    </Drawer>
  );
}

function RecentActivity() {
  const classes = useStyles();
  return <div>TODO: RECENT ACTIVITY</div>;
}

function AddConnectWallet() {
  const classes = useStyles();
  return <div>TODO: ADD CONNECT WALLET</div>;
}

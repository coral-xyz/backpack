import { useState } from "react";
import {
  useTheme,
  makeStyles,
  Typography,
  IconButton,
  Tabs,
  Tab,
} from "@material-ui/core";
import {
  Menu,
  SwapHoriz,
  Settings,
  Apps,
  MonetizationOn,
  PriorityHigh,
  Close,
} from "@material-ui/icons";
import Sidebar from "react-sidebar";
import { EXTENSION_WIDTH, EXTENSION_HEIGHT } from "../../common";
import { KeyringStoreStateEnum } from "../../keyring/store";
import { useKeyringStoreStateContext } from "../../context/KeyringStoreState";
import {
  useTabNavigationContext,
  TabNavigationProvider,
} from "../../context/TabNavigation";

const useStyles = makeStyles((theme: any) => ({
  layoutContainer: {
    width: `${EXTENSION_WIDTH}px`,
    height: `${EXTENSION_HEIGHT}px`,
    backgroundColor: theme.custom.colors.background,
    display: "flex",
    flexDirection: "column",
  },
  navBarContainer: {
    height: "46px",
    borderBottom: `solid 1pt ${theme.custom.colors.offText}`,
    display: "flex",
    justifyContent: "space-between",
    paddingLeft: "16px",
    paddingRight: "16px",
    paddingTop: "10px",
    paddingBottom: "10px",
  },
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
  connectedIcon: {
    width: "12px",
    height: "12px",
    borderRadius: "6px",
    backgroundColor: theme.custom.colors.connected,
    position: "absolute",
    right: 0,
  },
  disconnectedIcon: {
    width: "12px",
    height: "12px",
    borderRadius: "6px",
    backgroundColor: theme.custom.colors.disconnected,
    position: "absolute",
    right: 0,
  },
  centerDisplayContainer: {
    color: theme.custom.colors.fontColor,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
  tab: {
    color: theme.custom.colors.offText,
  },
}));

export function Layout(props: any) {
  const classes = useStyles();
  const { keyringStoreState } = useKeyringStoreStateContext();
  return (
    <TabNavigationProvider>
      <div className={classes.layoutContainer}>
        <NavBar />
        {props.children}
        {keyringStoreState === KeyringStoreStateEnum.Unlocked && <TabBarNav />}
      </div>
    </TabNavigationProvider>
  );
}

function NavBar() {
  const classes = useStyles();
  return (
    <div className={classes.navBarContainer}>
      <MenuButton />
      <CenterDisplay />
      <ConnectionIcon />
    </div>
  );
}

function MenuButton() {
  const classes = useStyles();
  const theme = useTheme() as any;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div id="outer-container" className={classes.menuButtonContainer}>
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
  return (
    <div>
      <SidebarHeader close={close} />
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

function CenterDisplay() {
  const classes = useStyles();
  const { keyringStoreState } = useKeyringStoreStateContext();
  const isLocked = keyringStoreState == KeyringStoreStateEnum.Locked;
  return (
    <div className={classes.centerDisplayContainer}>
      {isLocked ? <LockedCenterDisplay /> : <UnlockedCenterDisplay />}
    </div>
  );
}

function LockedCenterDisplay() {
  return (
    <div>
      <b>200ms</b>
    </div>
  );
}

function UnlockedCenterDisplay() {
  const { keyringStoreState } = useKeyringStoreStateContext();
  const isLocked = keyringStoreState == KeyringStoreStateEnum.Locked;
  return <div>Unlocked display TODO</div>;
}

function ConnectionIcon() {
  const classes = useStyles();
  const isConnected = false;
  return (
    <div className={classes.menuButtonContainer}>
      <div
        className={
          isConnected ? classes.connectedIcon : classes.disconnectedIcon
        }
      ></div>
    </div>
  );
}

function TabBarNav() {
  const classes = useStyles();
  const { tab, setTab } = useTabNavigationContext();
  return (
    <Tabs
      value={tab}
      onChange={(_e, newValue) => setTab(newValue)}
      variant="fullWidth"
      indicatorColor="primary"
      textColor="primary"
    >
      <Tab className={classes.tab} icon={<MonetizationOn />} />
      <Tab className={classes.tab} icon={<Apps />} />
      <Tab className={classes.tab} icon={<SwapHoriz />} />
      <Tab className={classes.tab} icon={<PriorityHigh />} />
      <Tab className={classes.tab} icon={<Settings />} />
    </Tabs>
  );
}

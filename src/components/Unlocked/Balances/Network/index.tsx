import { useEffect, useState } from "react";
import {
  makeStyles,
  useTheme,
  IconButton,
  Typography,
  Tabs,
  Tab,
} from "@material-ui/core";
import { OfflineBolt as Bolt } from "@material-ui/icons";
import { useNavigationContext } from "../../../../context/Navigation";
import { WithDrawer } from "../../../Layout/Drawer";
import { Nfts } from "./Nfts";
import { Swap } from "./Swap";
import { Overview } from "./Overview";
import { Transfer } from "./Transfer";
import { Yield } from "./Yield";
import { RecentActivity } from "./RecentActivity";

const useStyles = makeStyles((theme: any) => ({
  cardContainer: {},
  subNavigation: {
    borderBottom: `solid 1pt ${theme.custom.colors.border}`,
    backgroundColor: theme.custom.colors.nav,
    height: "48px",
  },
  tabIndicator: {
    color: theme.custom.colors.activeNavButton,
    backgroundColor: theme.custom.colors.activeNavButton,
  },
  tabSelected: {
    color: theme.custom.colors.activeNavButton,
  },
  tab: {
    color: theme.custom.colors.secondary,
    minWidth: "50px",
  },
  tabLabel: {
    fontSize: "14px",
    fontWeight: 500,
    textTransform: "none",
  },
  tabLabelSelected: {
    fontSize: "14px",
    fontWeight: 500,
    textTransform: "none",
    color: theme.custom.colors.activeNavButton,
  },
  tabRoot: {
    padding: 0,
  },
  tabsRoot: {
    marginLeft: "16px",
    marginRight: "16px",
  },
  flexContainer: {
    justifyContent: "space-between",
  },
  networkSettingsButtonContainer: {
    display: "flex",
    flexDirection: "row-reverse",
    width: "38px",
  },
  networkSettingsButton: {
    padding: 0,
    "&:hover": {
      background: "transparent",
    },
  },
  networkSettingsIcon: {
    color: theme.custom.colors.secondary,
  },
}));

export function Network({ blockchain }: any) {
  const [tab, setTab] = useState("overview");
  const { setNavBorderBottom, setNavButtonRight } = useNavigationContext();

  // Customize the nav bar for this page.
  useEffect(() => {
    setNavBorderBottom(false);
    setNavButtonRight(<NetworkSettingsButton />);
    return () => {
      setNavBorderBottom(true);
      setNavButtonRight(null);
    };
  }, [setNavBorderBottom, setNavButtonRight]);

  return (
    <div>
      <NetworkHeader blockchain={blockchain} tab={tab} setTab={setTab} />
      {tab === "overview" && <Overview blockchain={blockchain} />}
      {tab === "nfts" && <Nfts blockchain={blockchain} />}
      {tab === "swap" && <Swap blockchain={blockchain} />}
      {tab === "transfer" && <Transfer blockchain={blockchain} />}
      {tab === "yield" && <Yield blockchain={blockchain} />}
    </div>
  );
}

function NetworkSettingsButton() {
  const classes = useStyles();
  const [openDrawer, setOpenDrawer] = useState(false);
  return (
    <div className={classes.networkSettingsButtonContainer}>
      <IconButton
        disableRipple
        className={classes.networkSettingsButton}
        onClick={() => setOpenDrawer(true)}
      >
        <Bolt className={classes.networkSettingsIcon} />
      </IconButton>
      <WithDrawer
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
        title={"Recent Activity"}
      >
        <RecentActivity />
      </WithDrawer>
    </div>
  );
}

function NetworkHeader({ blockchain, tab, setTab }: any) {
  const classes = useStyles();
  const theme = useTheme() as any;

  if (blockchain !== "solana") {
    throw new Error("only solana currently supported");
  }
  const className = (tabName: string) => {
    if (tab === tabName) {
      return classes.tabLabelSelected;
    }
    return classes.tabLabel;
  };

  return (
    <div className={classes.subNavigation}>
      <Tabs
        classes={{
          root: classes.tabsRoot,
          flexContainer: classes.flexContainer,
        }}
        TabIndicatorProps={{
          style: {
            color: theme.custom.colors.activeNavButton,
            backgroundColor: theme.custom.colors.activeNavButton,
          },
        }}
        value={tab}
        onChange={(_e, newValue) => setTab(newValue)}
      >
        <Tab
          disableRipple
          classes={{
            root: classes.tabRoot,
            selected: classes.tabSelected,
          }}
          className={classes.tab}
          value="overview"
          label={
            <Typography className={className("overview")}>Overview</Typography>
          }
        />
        <Tab
          disableRipple
          classes={{
            root: classes.tabRoot,
            selected: classes.tabSelected,
          }}
          className={classes.tab}
          value="nfts"
          label={<Typography className={className("nfts")}>NFTs</Typography>}
        />
        <Tab
          disableRipple
          classes={{
            root: classes.tabRoot,
            selected: classes.tabSelected,
          }}
          className={classes.tab}
          value="swap"
          label={<Typography className={className("swap")}>Swap</Typography>}
        />
        <Tab
          disableRipple
          classes={{
            root: classes.tabRoot,
            selected: classes.tabSelected,
          }}
          className={classes.tab}
          value="transfer"
          label={
            <Typography className={className("transfer")}>Transfer</Typography>
          }
        />
        <Tab
          disableRipple
          classes={{
            root: classes.tabRoot,
            selected: classes.tabSelected,
          }}
          className={classes.tab}
          value="yield"
          label={<Typography className={className("yield")}>Yield</Typography>}
        />
      </Tabs>
    </div>
  );
}

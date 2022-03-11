import { makeStyles, useTheme, Tabs, Tab } from "@material-ui/core";
import { SwapHoriz, Settings, Apps, MonetizationOn } from "@material-ui/icons";
import { useTabContext } from "../../context/Tab";

const useStyles = makeStyles((theme: any) => ({
  tab: {
    backgroundColor: theme.custom.colors.nav,
    borderTop: `solid 1pt ${theme.custom.colors.border}`,
    color: theme.custom.colors.tabIconBackground,
    height: "64px",
  },
  tabRoot: {
    height: "64px",
    minHeight: "64px",
  },
  tabIndicator: {
    color: "none",
  },
  tabSelected: {
    color: theme.custom.colors.tabIconSelected,
  },
  tabUnselected: {},
}));

export function TabBar() {
  const classes = useStyles();
  const theme = useTheme() as any;
  const { tab, setTab } = useTabContext();
  const className = (idx: number) => {
    if (idx === tab) {
      return classes.tabSelected;
    }
    return classes.tabUnselected;
  };
  return (
    <Tabs
      value={tab}
      onChange={(_e, newValue) => setTab(newValue)}
      variant="fullWidth"
      classes={{
        root: classes.tabRoot,
        indicator: classes.tabIndicator,
      }}
      textColor={theme.custom.colors.activeNavButton}
      TabIndicatorProps={{
        style: {
          display: "none",
        },
      }}
      TabScrollButtonProps={{
        style: {
          color: "red",
        },
      }}
    >
      <Tab
        className={classes.tab}
        icon={<MonetizationOn className={className(0)} />}
      />
      <Tab className={classes.tab} icon={<Apps className={className(1)} />} />
      <Tab
        className={classes.tab}
        icon={<SwapHoriz className={className(2)} />}
      />
      <Tab
        className={classes.tab}
        icon={<Settings className={className(3)} />}
      />
    </Tabs>
  );
}

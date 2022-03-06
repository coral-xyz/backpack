import { makeStyles } from "@material-ui/core";
import { EXTENSION_WIDTH, EXTENSION_HEIGHT } from "../../common";
import { KeyringStoreStateEnum } from "../../keyring/store";
import { useKeyringStoreStateContext } from "../../context/KeyringStoreState";
import { TabNavigationProvider } from "../../context/TabNavigation";
import { NavBar } from "./Nav";
import { TabBar } from "./Tab";

const useStyles = makeStyles((theme: any) => ({
  layoutContainer: {
    width: `${EXTENSION_WIDTH}px`,
    height: `${EXTENSION_HEIGHT}px`,
    backgroundColor: theme.custom.colors.background,
    display: "flex",
    flexDirection: "column",
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
        {keyringStoreState === KeyringStoreStateEnum.Unlocked && <TabBar />}
      </div>
    </TabNavigationProvider>
  );
}

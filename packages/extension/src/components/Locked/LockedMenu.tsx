import { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import { useEphemeralNav } from "@coral-xyz/recoil";
import { WithDrawer } from "../Layout/Drawer";
import { Reset } from "./Reset";

const useStyles = makeStyles((theme: any) => ({
  root: {
    backgroundColor: theme.custom.colors.nav,
  },
  hamburgerRoot: {
    color: theme.custom.colors.hamburger,
  },
  listContainer: {
    color: theme.custom.colors.fontColor,
  },
}));

export function LockedMenu() {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <Toolbar classes={{ root: classes.root }}>
      <IconButton color="inherit" onClick={() => setOpen(true)}>
        <MenuIcon classes={{ root: classes.hamburgerRoot }} />
      </IconButton>

      <WithDrawer
        openDrawer={open}
        setOpenDrawer={setOpen}
        title={""}
        navbarStyle={{
          borderBottom: undefined,
          // @ts-ignore
          backgroundColor: theme.custom.colors.nav,
        }}
        navContentStyle={{
          // @ts-ignore
          backgroundColor: theme.custom.colors.nav,
          padding: "24px",
        }}
        className={classes.root}
      >
        <LockedMenuList closeDrawer={() => setOpen(false)} />
      </WithDrawer>
    </Toolbar>
  );
}

export function LockedMenuList({ closeDrawer }: { closeDrawer: () => void }) {
  const classes = useStyles();
  const nav = useEphemeralNav();

  const options = [
    {
      text: "Reset Secret Recovery Phrase",
      onClick: () => nav.push(<Reset closeDrawer={closeDrawer} />),
    },
    {
      text: "Help & Support",
      onClick: () => console.log("help & support"),
    },
    {
      text: "Backpack.app",
      onClick: () => window.open("https://backpack.app", "_blank"),
    },
  ];

  return (
    <Box className={classes.listContainer}>
      <List>
        {options.map((o) => (
          <ListItem
            onClick={o.onClick}
            key={o.text}
            style={{ textAlign: "center" }}
          >
            <ListItemText primary={o.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

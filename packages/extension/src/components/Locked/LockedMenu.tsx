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
import { useCustomTheme } from "@coral-xyz/themes";
import { useEphemeralNav } from "@coral-xyz/recoil";
import { WithDrawer } from "../Layout/Drawer";
import { Reset } from "./Reset";

export function LockedMenu({ menuOpen, setMenuOpen }: any) {
  const theme = useCustomTheme();
  return (
    <Toolbar sx={{ bgcolor: theme.custom.colors.nav }}>
      <IconButton color="inherit" onClick={() => setMenuOpen(true)}>
        <MenuIcon sx={{ color: theme.custom.colors.hamburger }} />
      </IconButton>

      <WithDrawer
        openDrawer={menuOpen}
        setOpenDrawer={setMenuOpen}
        title={""}
        navbarStyle={{
          borderBottom: undefined,
          // @ts-ignore
          backgroundColor: theme.custom.colors.nav,
        }}
        navContentStyle={{
          // @ts-ignore
          backgroundColor: theme.custom.colors.nav,
          padding: "0 24px 24px 24px",
        }}
      >
        <LockedMenuList closeDrawer={() => setMenuOpen(false)} />
      </WithDrawer>
    </Toolbar>
  );
}

export function LockedMenuList({ closeDrawer }: { closeDrawer: () => void }) {
  const theme = useCustomTheme();
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
    <Box sx={{ color: theme.custom.colors.fontColor }}>
      <List>
        {options.map((o) => (
          <ListItem
            onClick={o.onClick}
            key={o.text}
            sx={{
              textAlign: "center",
            }}
          >
            <ListItemText sx={{ cursor: "pointer" }} primary={o.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

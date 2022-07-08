import { Fragment, useState } from "react";
import { Box, ListItemText, Toolbar, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockIcon from "@mui/icons-material/Lock";
import SupportIcon from "@mui/icons-material/Support";
import { useCustomTheme } from "@coral-xyz/themes";
import { useEphemeralNav } from "@coral-xyz/recoil";
import { List, ListItem } from "../common/List";
import { WithEphemeralNavDrawer } from "../Layout/Drawer";
import { Reset } from "./Reset";
import { NAV_BAR_HEIGHT, WithNav, NavBackButton } from "../Layout/Nav";

type Page = "menu" | "reset";

export function LockedMenu({ menuOpen, setMenuOpen }: any) {
  const theme = useCustomTheme() as any;
  const [page, setPage] = useState<Page>("menu");
  return (
    <Toolbar
      sx={{
        display: "flex",
        flexDirection: "row-reverse",
        paddingLeft: "16px",
        paddingRight: "16px",
        paddingTop: "10px",
        paddingBottom: "10px",
        height: NAV_BAR_HEIGHT,
      }}
    >
      <IconButton
        color="inherit"
        onClick={() => setMenuOpen(true)}
        sx={{ padding: 0 }}
      >
        <MenuIcon sx={{ color: theme.custom.colors.hamburger }} />
      </IconButton>
      <WithEphemeralNavDrawer
        title=""
        openDrawer={menuOpen}
        setOpenDrawer={setMenuOpen}
        navbarStyle={{
          backgroundColor: theme.custom.colors.nav,
          borderBottom: "none",
        }}
        navContentStyle={{
          backgroundColor: theme.custom.colors.nav,
        }}
      >
        <LockedMenuList setMenuOpen={setMenuOpen} />
      </WithEphemeralNavDrawer>
    </Toolbar>
  );
}

export function LockedMenuList({ setMenuOpen }: any) {
  const theme = useCustomTheme();
  const nav = useEphemeralNav();

  const options = [
    {
      icon: (
        <AccountCircleIcon style={{ color: theme.custom.colors.secondary }} />
      ),
      text: "Reset Secret Recovery Phrase",
      onClick: () => nav.push(<Reset closeDrawer={() => setMenuOpen(false)} />),
    },
    {
      icon: <SupportIcon style={{ color: theme.custom.colors.secondary }} />,
      text: "Help & Support",
      onClick: () => console.log("help & support"),
    },
    {
      icon: <LockIcon style={{ color: theme.custom.colors.secondary }} />,
      text: "Backpack.app",
      onClick: () => window.open("https://backpack.app", "_blank"),
    },
  ];

  return (
    <Box sx={{ color: theme.custom.colors.fontColor }}>
      <List
        style={{
          background: theme.custom.colors.bg2,
          marginLeft: "16px",
          marginRight: "16px",
        }}
      >
        {options.map((o, idx) => (
          <ListItem
            onClick={o.onClick}
            key={o.text}
            style={{
              height: "44px",
              display: "flex",
            }}
            isLast={idx === options.length - 1}
            borderColor={theme.custom.colors.border1}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              {o.icon}
            </div>
            <ListItemText
              sx={{
                marginLeft: "8px",
                fontSize: "16px",
                lineHeight: "24px",
                fontWeight: 500,
              }}
              primary={o.text}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

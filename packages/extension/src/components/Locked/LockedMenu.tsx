import { Fragment, useState } from "react";
import { Box, ListItemText, Toolbar, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockIcon from "@mui/icons-material/Lock";
import SupportIcon from "@mui/icons-material/Support";
import { useCustomTheme } from "@coral-xyz/themes";
import { List, ListItem } from "../common/List";
import { WithDrawer } from "../Layout/Drawer";
import { Reset } from "./Reset";
import { NAV_BAR_HEIGHT } from "../Layout/Nav";

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
      <WithDrawer
        title=""
        openDrawer={menuOpen}
        setOpenDrawer={setMenuOpen}
        navbarStyle={{
          borderBottom: undefined,
          backgroundColor: theme.custom.colors.nav,
        }}
        navContentStyle={{
          backgroundColor: theme.custom.colors.nav,
        }}
      >
        {page === "menu" && <LockedMenuList setPage={setPage} />}
        {page === "reset" && (
          <Reset
            onBack={() => setPage("menu")}
            closeDrawer={() => setMenuOpen(false)}
          />
        )}
      </WithDrawer>
    </Toolbar>
  );
}

export function LockedMenuList({ setPage }: { setPage: (page: Page) => void }) {
  const theme = useCustomTheme();

  const options = [
    {
      icon: (
        <AccountCircleIcon style={{ color: theme.custom.colors.secondary }} />
      ),
      text: "Reset Secret Recovery Phrase",
      onClick: () => setPage("reset"),
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
          <Fragment key={idx}>
            <ListItem
              onClick={o.onClick}
              style={{
                height: "44px",
                display: "flex",
              }}
              isLast={idx === options.length - 1}
            >
              {o.icon}
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
          </Fragment>
        ))}
      </List>
    </Box>
  );
}

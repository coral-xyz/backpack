import { Box, ListItemText, Toolbar, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockIcon from "@mui/icons-material/Lock";
import SupportIcon from "@mui/icons-material/Support";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { useEphemeralNav } from "@coral-xyz/recoil";
import { List, ListItem } from "../common/List";
import { WithDrawer } from "../Layout/Drawer";
import { WithEphemeralNav } from "../Layout/NavEphemeral";
import { Reset } from "./Reset";
import { NAV_BAR_HEIGHT } from "../Layout/Nav";

export function LockedMenu({ menuOpen, setMenuOpen }: any) {
  const theme = useCustomTheme();
  return (
    <>
      <Box
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
      </Box>
      <WithDrawer openDrawer={menuOpen} setOpenDrawer={setMenuOpen}>
        <WithEphemeralNav
          title={"Settings"}
          navbarStyle={{
            borderBottom: "none",
          }}
        >
          <LockedMenuList closeDrawer={() => setMenuOpen(false)} />
        </WithEphemeralNav>
      </WithDrawer>
    </>
  );
}

export function LockedMenuList({ closeDrawer }: { closeDrawer: () => void }) {
  const theme = useCustomTheme();
  const nav = useEphemeralNav();

  const options = [
    {
      icon: (
        <AccountCircleIcon style={{ color: theme.custom.colors.secondary }} />
      ),
      text: "Reset Secret Recovery Phrase",
      onClick: () => {
        closeDrawer();
        nav.push(<Reset closeDrawer={closeDrawer} />);
      },
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
    <Box
      sx={{
        color: theme.custom.colors.fontColor,
        paddingTop: "40px",
        paddingBottom: "40px",
      }}
    >
      <List
        style={{
          background: "#3F3F46",
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
        ))}
      </List>
    </Box>
  );
}

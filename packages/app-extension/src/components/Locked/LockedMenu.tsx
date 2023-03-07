import { useEffect,useState } from "react";
import {
  BACKPACK_LINK,
  DISCORD_INVITE_LINK,
  TWITTER_LINK,
} from "@coral-xyz/common";
import { DiscordIcon, List, ListItem } from "@coral-xyz/react-common";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import AccountCircleIcon from "@mui/icons-material/AccountCircleOutlined";
import CallMadeIcon from "@mui/icons-material/CallMade";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LockIcon from "@mui/icons-material/Lock";
import MenuIcon from "@mui/icons-material/Menu";
import TwitterIcon from "@mui/icons-material/Twitter";
import { Box, IconButton, ListItemText, Toolbar } from "@mui/material";

import { CloseButton, WithMiniDrawer } from "../common/Layout/Drawer";
import { NAV_BAR_HEIGHT } from "../common/Layout/Nav";
import {
  NavStackEphemeral,
  NavStackScreen,
  useNavigation,
} from "../common/Layout/NavStack";

import { ResetWarning } from "./Reset/ResetWarning";
import { Reset } from "./Reset";

const useStyles = styles((theme) => ({
  listItemRoot: {
    height: "44px",
    display: "flex",
    backgroundColor: `${theme.custom.colors.nav} !important`,
  },
}));

export function LockedMenu({ menuOpen, setMenuOpen }: any) {
  const theme = useCustomTheme() as any;
  return (
    <Toolbar
      sx={{
        zIndex: 2,
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
        disableRipple
        color="inherit"
        onClick={() => setMenuOpen(true)}
        sx={{
          padding: 0,
          "&:hover": {
            background: "transparent !important",
            backgroundColor: "transparent !important",
          },
        }}
      >
        <MenuIcon sx={{ color: theme.custom.colors.icon }} />
      </IconButton>
      <WithMiniDrawer
        openDrawer={menuOpen}
        setOpenDrawer={setMenuOpen}
        backdropProps={{
          style: {
            opacity: 0.8,
            background: "#18181b",
          },
        }}
        paperProps={{
          sx: {
            background: theme.custom.colors.backgroundBackdrop,
            height: "90%",
          },
        }}
      >
        <div style={{ height: "100%" }}>
          <NavStackEphemeral
            initialRoute={{ name: "root" }}
            options={() => ({ title: "" })}
            navButtonLeft={<CloseButton onClick={() => setMenuOpen(false)} />}
          >
            <NavStackScreen
              name="root"
              component={(props: any) => <LockedMenuList {...props} />}
            />
            <NavStackScreen
              name="reset"
              component={(props: any) => <Reset {...props} />}
            />
            <NavStackScreen
              name="reset-warning"
              component={(props: any) => <ResetWarning {...props} />}
            />
          </NavStackEphemeral>
        </div>
      </WithMiniDrawer>
    </Toolbar>
  );
}

export function LockedMenuList() {
  const theme = useCustomTheme();
  const nav = useNavigation();
  const classes = useStyles();

  const options = [
    {
      icon: <AccountCircleIcon style={{ color: theme.custom.colors.icon }} />,
      text: "Reset Backpack",
      onClick: () => nav.push("reset"),
      suffix: (
        <ChevronRightIcon
          style={{
            flexShrink: 1,
            alignSelf: "center",
            color: theme.custom.colors.icon,
          }}
        />
      ),
    },
    {
      icon: <LockIcon style={{ color: theme.custom.colors.icon }} />,
      text: "Backpack.app",
      onClick: () => window.open(BACKPACK_LINK, "_blank"),
    },
    {
      icon: <TwitterIcon style={{ color: theme.custom.colors.icon }} />,
      text: "Twitter",
      onClick: () => window.open(TWITTER_LINK, "_blank"),
    },
    {
      icon: <DiscordIcon fill={theme.custom.colors.icon} />,
      text: "Need help? Hop into Discord",
      onClick: () => window.open(DISCORD_INVITE_LINK, "_blank"),
    },
  ];

  return (
    <Box sx={{ color: theme.custom.colors.fontColor }}>
      <List
        style={{
          marginLeft: "16px",
          marginRight: "16px",
          border: theme.custom.colors.borderFull,
        }}
      >
        {options.map((o, idx) => (
          <ListItem
            onClick={o.onClick}
            key={o.text}
            isFirst={idx === 0}
            isLast={idx === options.length - 1}
            borderColor={theme.custom.colors.nav}
            classes={{ root: classes.listItemRoot }}
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
            {o.suffix ?? (
              <CallMadeIcon
                style={{
                  flexShrink: 1,
                  alignSelf: "center",
                  color: theme.custom.colors.icon,
                }}
              />
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useRef,
  useState,
} from "react";
import {
  Box,
  Drawer,
  Grid,
  IconButton,
  ListItemText,
  Toolbar,
} from "@mui/material";
import {
  AddCircle,
  ArrowCircleDown,
  CallMade,
  Lock,
  Menu,
  Support,
  Twitter,
} from "@mui/icons-material";
import {
  DISCORD_INVITE_LINK,
  TWITTER_LINK,
  BACKPACK_LINK,
} from "@coral-xyz/common";
import { DiscordIcon } from "../common/Icon";
import { useCustomTheme, styles } from "@coral-xyz/themes";
import { ActionCard } from "../common/Layout/ActionCard";
import { BackpackHeader } from "../Locked";
import { NAV_BAR_HEIGHT } from "../common/Layout/Nav";
import { List, ListItem } from "../common/List";
import { WithContaineredDrawer } from "../common/Layout/Drawer";
import type { OnboardingFlows } from "./";

const useStyles = styles((theme) => ({
  listItemRoot: {
    backgroundColor: "transparent !important",
  },
}));

export function OnboardingWelcome({
  onSelect,
}: {
  onSelect: (flow: OnboardingFlows) => void;
}) {
  const theme = useCustomTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef(null);

  return (
    <div
      style={{
        display: "flex",
        textAlign: "center",
        justifyContent: "space-between",
        flexDirection: "column",
        height: "100%",
        padding: "0 16px 16px 16px",
        position: "relative",
        overflow: "hidden",
      }}
      ref={containerRef}
    >
      <Box>
        <OnboardingMenu
          containerRef={containerRef}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
        />
        <BackpackHeader
          alphaStyle={{
            marginRight: "42px",
          }}
        />
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <ActionCard
            icon={<AddCircle />}
            text="Create a new wallet"
            onClick={() => onSelect("create-wallet")}
          />
        </Grid>
        <Grid item xs={6}>
          <ActionCard
            icon={<ArrowCircleDown />}
            text="Import an existing wallet"
            onClick={() => onSelect("import-wallet")}
          />
        </Grid>
      </Grid>
    </div>
  );
}

function OnboardingMenu({
  containerRef,
  menuOpen,
  setMenuOpen,
}: {
  containerRef: MutableRefObject<any>;
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const theme = useCustomTheme();

  return (
    <Toolbar
      sx={{
        display: "flex",
        flexDirection: "row-reverse",
        padding: "0 !important",
        minHeight: "0 !important",
        height: NAV_BAR_HEIGHT,
      }}
    >
      <IconButton
        disableRipple
        onClick={() => setMenuOpen(true)}
        sx={{ padding: 0 }}
      >
        <Menu sx={{ color: theme.custom.colors.secondary }} />
      </IconButton>
      <WithContaineredDrawer
        containerRef={containerRef}
        openDrawer={menuOpen}
        setOpenDrawer={setMenuOpen}
        paperStyles={{
          borderRadius: "12px",
        }}
        backdropStyles={{ borderRadius: "12px" }}
      >
        <OnboardingMenuList />
      </WithContaineredDrawer>
    </Toolbar>
  );
}

function OnboardingMenuList() {
  const classes = useStyles();
  const theme = useCustomTheme();

  const options = [
    {
      icon: <Support style={{ color: theme.custom.colors.secondary }} />,
      text: "Help & Support",
      onClick: () => window.open(DISCORD_INVITE_LINK, "_blank"),
    },
    {
      icon: <Lock style={{ color: theme.custom.colors.secondary }} />,
      text: "Backpack.app",
      onClick: () => window.open(BACKPACK_LINK, "_blank"),
    },
    {
      icon: <Twitter style={{ color: theme.custom.colors.secondary }} />,
      text: "Twitter",
      onClick: () => window.open(TWITTER_LINK, "_blank"),
    },
    {
      icon: <DiscordIcon fill={theme.custom.colors.secondary} />,
      text: "Discord",
      onClick: () => window.open(DISCORD_INVITE_LINK, "_blank"),
    },
  ];

  return (
    <Box sx={{ color: theme.custom.colors.fontColor }}>
      <List
        style={{
          backgroundColor: theme.custom.colors.bg2,
          marginLeft: "16px",
          marginRight: "16px",
          marginTop: "40px",
          marginBottom: "40px",
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
            classes={{
              root: classes.listItemRoot,
            }}
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
            <CallMade
              style={{
                flexShrink: 1,
                alignSelf: "center",
                color: theme.custom.colors.secondary,
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

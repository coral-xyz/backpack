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
import { DiscordIcon } from "../Icon";
import { useCustomTheme } from "@coral-xyz/themes";
import { ActionCard } from "../Layout/ActionCard";
import { BackpackHeader } from "../Locked";
import { NAV_BAR_HEIGHT } from "../Layout/Nav";
import { List, ListItem } from "../common/List";
import { WithContaineredDrawer } from "../Layout/Drawer";
import type { OnboardingFlows } from "./";

export function OnboardingWelcome({
  onSelect,
}: {
  onSelect: (flow: OnboardingFlows) => void;
}) {
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
      <IconButton onClick={() => setMenuOpen(true)} sx={{ padding: 0 }}>
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
  const theme = useCustomTheme();

  const options = [
    {
      icon: <Support style={{ color: theme.custom.colors.secondary }} />,
      text: "Help & Support",
      onClick: () => console.log("help & support"), // TODO:
    },
    {
      icon: <Lock style={{ color: theme.custom.colors.secondary }} />,
      text: "Backpack.app",
      onClick: () => window.open("https://backpack.app", "_blank"),
    },
    {
      icon: <Twitter style={{ color: theme.custom.colors.secondary }} />,
      text: "Twitter",
      onClick: () => window.open("https://twitter.com/xNFT_Backpack", "_blank"),
    },
    {
      icon: <DiscordIcon fill={theme.custom.colors.secondary} />,
      text: "Discord",
      onClick: () => console.log("discord"), // TODO:
    },
  ];

  return (
    <Box sx={{ color: theme.custom.colors.fontColor }}>
      <List
        style={{
          background: theme.custom.colors.bg2,
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

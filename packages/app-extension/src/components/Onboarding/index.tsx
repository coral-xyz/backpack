import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import { useRef, useState } from "react";
import {
  BACKPACK_LINK,
  DISCORD_INVITE_LINK,
  EXTENSION_HEIGHT,
  EXTENSION_WIDTH,
  TWITTER_LINK,
} from "@coral-xyz/common";
import { DiscordIcon, List, ListItem } from "@coral-xyz/react-common";
import { OnboardingProvider, useKeyringStoreState } from "@coral-xyz/recoil";
import { KeyringStoreState } from "@coral-xyz/secure-background/types";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { CallMade, Lock, Menu, Twitter } from "@mui/icons-material";
import { Box, IconButton, ListItemText, Toolbar } from "@mui/material";

import { WithContaineredDrawer } from "../common/Layout/Drawer";
import { NAV_BAR_HEIGHT } from "../common/Layout/Nav";

import { OnboardAccount } from "./pages/OnboardAccount";
import { RecoverAccount } from "./pages/RecoverAccount";

export const Onboarding = ({
  isAddingAccount,
}: {
  isAddingAccount?: boolean;
}) => {
  const containerRef = useRef();
  const [menuOpen, setMenuOpen] = useState(false);
  const [action, setAction] = useState<"onboard" | "recover">("onboard");

  const _ks = useKeyringStoreState();
  const isOnboarded =
    !isAddingAccount && _ks !== KeyringStoreState.NeedsOnboarding;

  const defaultProps = {
    containerRef,
    // Props for the WithNav component
    navProps: {
      navButtonRight: (
        <OnboardingMenu
          containerRef={containerRef}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
        />
      ),
      navbarStyle: {
        borderRadius: "12px",
      },
      navContentStyle: {
        borderRadius: "12px",
        overflow: "hidden",
        display: "flex",
      },
    },
    isAddingAccount,
    isOnboarded,
  };

  return (
    <OptionsContainer innerRef={containerRef}>
      {action === "onboard" ? (
        <OnboardingProvider>
          <OnboardAccount
            onRecover={() => setAction("recover")}
            {...defaultProps}
          />
        </OnboardingProvider>
      ) : null}
      {action === "recover" ? (
        <OnboardingProvider>
          <RecoverAccount
            onClose={() => setAction("onboard")}
            {...defaultProps}
          />
        </OnboardingProvider>
      ) : null}
    </OptionsContainer>
  );
};

export function OptionsContainer({
  innerRef,
  children,
}: {
  innerRef?: any;
  children: React.ReactNode;
}) {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        backgroundColor: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          margin: "0 auto",
          overflow: "hidden",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.25)",
          width: "100vw",
          height: "100vh",
          background: `
            radial-gradient(farthest-side at 0 0, #6360FF, rgba(255,255,255,0) 100%),
            radial-gradient(farthest-side at 100% 0, #C061F7, rgba(255,255,255,0) 100%),
            radial-gradient(farthest-side at 0 100%, #28DBD1 25%, rgba(255,255,255,0) 100%),
            radial-gradient(farthest-side at 100% 100%, #FE6F5C 25%, rgba(255,255,255,0) 100%)`,
        }}
      >
        <div
          ref={innerRef}
          style={{
            width: `${EXTENSION_WIDTH}px`,
            height: `${EXTENSION_HEIGHT}px`,
            display: "flex",
            flexDirection: "column",
            margin: "0 auto",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.25)",
            background: theme.custom.colors.backgroundBackdrop,
            position: "relative",
          }}
        >
          {children}
        </div>
      </div>
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
        <Menu sx={{ color: theme.custom.colors.icon }} />
      </IconButton>
      <WithContaineredDrawer
        containerRef={containerRef}
        openDrawer={menuOpen}
        setOpenDrawer={setMenuOpen}
        paperStyles={{
          borderRadius: "12px",
          background: theme.custom.colors.backgroundBackdrop,
        }}
        backdropStyles={{ borderRadius: "12px" }}
      >
        <OnboardingMenuList />
      </WithContaineredDrawer>
    </Toolbar>
  );
}

const useStyles = styles(() => ({
  listItemRoot: {
    backgroundColor: "transparent !important",
  },
}));

function OnboardingMenuList() {
  const classes = useStyles();
  const theme = useCustomTheme();
  const options = [
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
          marginTop: "40px",
          marginBottom: "40px",
          background: theme.custom.colors.nav,
          border: theme.custom.colors.borderFull,
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
            borderColor={theme.custom.colors.nav}
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

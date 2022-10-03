import {
  BACKPACK_FEATURE_USERNAMES,
  BACKPACK_LINK,
  DISCORD_INVITE_LINK,
  EXTENSION_HEIGHT,
  EXTENSION_WIDTH,
  TWITTER_LINK,
} from "@coral-xyz/common";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { CallMade, Lock, Menu, Twitter } from "@mui/icons-material";
import { Box, IconButton, ListItemText, Toolbar } from "@mui/material";
import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useRef,
  useState,
} from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { DiscordIcon } from "../common/Icon";
import { WithContaineredDrawer } from "../common/Layout/Drawer";
import { NavBackButton, NAV_BAR_HEIGHT, WithNav } from "../common/Layout/Nav";
import { List, ListItem } from "../common/List";
import { CreateOrImportWallet } from "./pages/CreateOrImportWallet";
import { Finish } from "./pages/Finish";
import { ImportAccounts } from "./pages/ImportAccounts";
import { InviteCodeForm } from "./pages/InviteCodeForm";
import {
  GenerateRecoveryPhrase,
  ImportRecoveryPhrase,
} from "./pages/RecoveryPhrase";
import { SetPassword } from "./pages/SetPassword";
import { UsernameForm } from "./pages/UsernameForm";
import WaitingRoom from "../common/WaitingRoom";

export const Onboarding = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const previous = pathname.split("/").slice(0, -1).join("/");
  const goBack =
    !pathname.endsWith("finish") && pathname !== "/"
      ? () => navigate(previous)
      : undefined;
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef();

  return (
    <OptionsContainer innerRef={containerRef}>
      <WithNav
        navButtonLeft={goBack ? <NavBackButton onClick={goBack} /> : undefined}
        navButtonRight={
          pathname === "/" ? (
            <OnboardingMenu
              containerRef={containerRef}
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
            />
          ) : undefined
        }
        navbarStyle={{
          borderRadius: "12px",
        }}
        navContentStyle={{
          borderRadius: "12px",
          overflow: "hidden",
          display: "flex",
        }}
      >
        <Routes>
          {BACKPACK_FEATURE_USERNAMES && (
            <>
              <Route path="/" element={<InviteCodeForm />} />
              <Route path="/waitingRoom" element={<WaitingRoom />} />
              <Route path="/:inviteCode" element={<UsernameForm />} />
            </>
          )}

          <Route path={p("")} element={<CreateOrImportWallet />} />

          {/* CREATE NEW WALLET ROUTE */}
          <Route path={p("create")} element={<GenerateRecoveryPhrase />} />
          <Route path={p("create/:mnemonic")} element={<SetPassword />} />
          <Route
            path={p("create/:mnemonic/:password/finish")}
            element={<Finish />}
          />

          {/* IMPORT EXISTING WALLET ROUTE */}
          <Route path={p("import")} element={<ImportRecoveryPhrase />} />
          <Route path={p("import/:mnemonic")} element={<ImportAccounts />} />
          <Route
            path={p("import/:mnemonic/:accountsAndDerivationPath")}
            element={<SetPassword />}
          />
          <Route
            path={p(
              "import/:mnemonic/:accountsAndDerivationPath/:password/finish"
            )}
            element={<Finish />}
          />
        </Routes>
      </WithNav>
    </OptionsContainer>
  );
};

const p = (path: string) =>
  BACKPACK_FEATURE_USERNAMES ? `/:inviteCode/:username/${path}` : `/${path}`;

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

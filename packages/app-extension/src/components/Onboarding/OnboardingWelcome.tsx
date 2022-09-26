import {
  Dispatch,
  lazy,
  MutableRefObject,
  SetStateAction,
  useRef,
  useState,
} from "react";
import {
  Box,
  Grid,
  IconButton,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  AddCircle,
  ArrowCircleDown,
  CallMade,
  Lock,
  Menu,
  Twitter,
} from "@mui/icons-material";
import {
  DISCORD_INVITE_LINK,
  TWITTER_LINK,
  BACKPACK_LINK,
  BACKPACK_FEATURE_USERNAMES,
} from "@coral-xyz/common";
import { DiscordIcon } from "../common/Icon";
import { useCustomTheme, styles } from "@coral-xyz/themes";
import { ActionCard } from "../common/Layout/ActionCard";
import { NAV_BAR_HEIGHT } from "../common/Layout/Nav";
import { List, ListItem } from "../common/List";
import { WithContaineredDrawer } from "../common/Layout/Drawer";
import type { OnboardingFlows } from "./";

const CheckInviteCodeForm = lazy(() => import("./CheckInviteCodeForm"));

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
  const [inviteCode, setInviteCode] = useState<any>();

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
      </Box>

      {BACKPACK_FEATURE_USERNAMES && !inviteCode ? (
        <CheckInviteCodeForm setInviteCode={setInviteCode} />
      ) : (
        <Box>
          <Typography style={{ margin: 8, marginBottom: 32 }}>
            Your username isn't secured just yet, please create a new wallet, or
            import an existing one so that it can be claimed.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <ActionCard
                icon={
                  <AddCircle
                    style={{
                      color: theme.custom.colors.icon,
                    }}
                  />
                }
                text="Create a new wallet"
                onClick={() =>
                  onSelect({ ...inviteCode, flow: "create-wallet" })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <ActionCard
                icon={
                  <ArrowCircleDown
                    style={{
                      color: theme.custom.colors.icon,
                    }}
                  />
                }
                text="Import an existing wallet"
                onClick={() =>
                  onSelect({ ...inviteCode, flow: "import-wallet" })
                }
              />
            </Grid>
          </Grid>
        </Box>
      )}
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

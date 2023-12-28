import type { ReactNode } from "react";
import {
  BACKPACK_FEATURE_XNFT,
  DISCORD_INVITE_LINK,
  TWITTER_LINK,
  XNFT_GG_LINK,
} from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  DiscordIcon,
  ExtensionIcon,
  PinIcon,
  PrimaryButton,
  TwitterIcon,
} from "@coral-xyz/react-common";
import { useTheme } from "@coral-xyz/tamagui";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";

import { Header, SubtextParagraph } from "../../common";
import { AppStoreIcon } from "../Icon";

export function SetupComplete({ onClose }: { onClose: () => void }) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: "40px",
          right: "40px",
        }}
      >
        <PinNotification />
        <ShortcutNotification />
      </div>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          color: theme.baseBackgroundL1.val,
        }}
      >
        <Box>
          <Box
            sx={{
              mt: "24px",
              ml: "24px",
              mr: "24px",
            }}
          >
            <Header text={t("post_setup.title")} />
            <SubtextParagraph
              style={{
                marginBottom: "25px",
              }}
            >
              {t("post_setup.description")}
            </SubtextParagraph>
          </Box>
          <Box
            sx={{
              ml: "16px",
              mr: "16px",
            }}
          >
            <Grid container spacing={1} columns={1}>
              {BACKPACK_FEATURE_XNFT ? (
                <Grid item xs={6}>
                  <CallToAction
                    icon={<AppStoreIcon />}
                    title={t("browse_xnft")}
                    onClick={() => window.open(XNFT_GG_LINK, "_blank")}
                  />
                </Grid>
              ) : null}
              <Grid item xs={6}>
                <CallToAction
                  icon={<TwitterIcon fill="#1D9BF0" />}
                  title={t("follow_on_twitter")}
                  onClick={() => window.open(TWITTER_LINK, "_blank")}
                />
              </Grid>
              <Grid item xs={6}>
                <CallToAction
                  icon={<DiscordIcon fill="#5865F2" />}
                  title={t("join_discord")}
                  onClick={() => window.open(DISCORD_INVITE_LINK, "_blank")}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Box
          sx={{
            ml: "16px",
            mr: "16px",
            mb: "16px",
          }}
        >
          <PrimaryButton
            label={`${t("visit_xnft_gg")}`}
            onClick={onClose}
            buttonLabelStyle={{
              fontWeight: 600,
            }}
          />
        </Box>
      </Box>
    </>
  );
}

function CallToAction({
  icon,
  title,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  onClick: () => void;
}) {
  const theme = useTheme();
  return (
    <Button
      disableRipple
      onClick={onClick}
      style={{
        padding: 0,
        textTransform: "none",
        border: `${theme.baseBorderLight.val}`,
        borderRadius: "12px",
        background: theme.baseBackgroundL1.val,
        width: "100%",
      }}
    >
      <Card
        sx={{
          p: 1,
          color: theme.baseTextHighEmphasis.val,
          cursor: "pointer",
          padding: "16px",
          boxShadow: "none",
          backgroundColor: "transparent",
          width: "100%",
        }}
      >
        <CardContent
          style={{ padding: 0, display: "flex", alignItems: "center", gap: 12 }}
        >
          {icon}
          <Box
            style={{
              fontSize: "16px",
              lineHeight: "24px",
              textAlign: "left",
            }}
          >
            {title}
          </Box>
        </CardContent>
      </Card>
    </Button>
  );
}

function PinNotification() {
  const theme = useTheme();
  return (
    <div
      style={{
        background: theme.accentBlue.val,
        paddingLeft: "24px",
        paddingRight: "24px",
        paddingTop: "16px",
        paddingBottom: "16px",
        color: theme.baseBackgroundL1.val,
        borderRadius: "12px",
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.25)",
      }}
    >
      <Typography
        style={{
          fontWeight: 700,
        }}
      >
        Pin the Backpack Extension
      </Typography>
      <div style={{ display: "flex", marginTop: "4px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            marginRight: "4px",
          }}
        >
          <Typography
            style={{
              fontSize: "16px",
              fontWeight: 500,
            }}
          >
            Click
          </Typography>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <ExtensionIcon fill={theme.baseBackgroundL1.val} />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            marginLeft: "4px",
            marginRight: "4px",
          }}
        >
          <Typography
            style={{
              fontSize: "16px",
              fontWeight: 500,
            }}
          >
            and
          </Typography>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <PinIcon fill={theme.baseBackgroundL1.val} />
        </div>
      </div>
    </div>
  );
}

function ShortcutNotification() {
  const theme = useTheme();
  const isMac = window.navigator.userAgent.includes("Mac OS");
  const command = isMac
    ? "\u21E7 Shift + \u2325 Option + B"
    : "\u21E7 Shift + \u2387 Alt + B";

  return (
    <div
      style={{
        background: theme.accentBlue.val,
        paddingLeft: "24px",
        paddingRight: "24px",
        paddingTop: "16px",
        paddingBottom: "16px",
        color: theme.baseBackgroundL1.val,
        borderRadius: "12px",
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.25)",
        marginTop: "12px",
      }}
    >
      <Typography style={{ fontWeight: 700 }}>
        Open Backpack at Any Time
      </Typography>
      <Typography>{command}</Typography>
    </div>
  );
}

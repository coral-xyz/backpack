import { useState } from "react";
import {
  BACKPACK_FEATURE_XNFT,
  DISCORD_INVITE_LINK,
  TWITTER_LINK,
  XNFT_GG_LINK,
} from "@coral-xyz/common";
import {
  DiscordIcon,
  ExtensionIcon,
  PinIcon,
  PrimaryButton,
  TwitterIcon,
  WidgetIcon,
} from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";
import { Box, Grid, Typography } from "@mui/material";

import {
  registerNotificationServiceWorker,
  saveSubscription,
} from "../../../permissions/utils";
import { Header, SubtextParagraph } from "../../common";
import { ActionCard } from "../../common/Layout/ActionCard";
import { SwitchToggle } from "../../Unlocked/Settings/Preferences";

export function SetupComplete({ onClose }: { onClose: () => void }) {
  const theme = useCustomTheme();
  const [notificationPermissionGranted, setNotificationPermissionGranted] =
    useState(false);

  const requestNotificationPermission = async () => {
    const permission = await window.Notification.requestPermission();
    if (permission !== "granted") {
      setNotificationPermissionGranted(false);
    }
  };

  const registerSubscription = async () => {
    registerNotificationServiceWorker()
      .then(async function (subscription) {
        setNotificationPermissionGranted(true);
        if (!subscription) {
          // Set appropriate app states.
          return;
        }
        await saveSubscription(subscription);
      })
      .catch(function () {
        setNotificationPermissionGranted(false);
      });
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: "16px",
          right: "16px",
        }}
      >
        <PinNotification />
      </div>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          color: theme.custom.colors.nav,
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
            <Header text="You’ve set up Backpack!" />
            <SubtextParagraph
              style={{
                marginBottom: "18px",
              }}
            >
              Now get started exploring what your Backpack can do.
            </SubtextParagraph>
          </Box>

          <Box
            sx={{
              ml: "24px",
              mr: "24px",
            }}
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <div>
              <SubtextParagraph
                style={{
                  marginBottom: "24px",
                }}
              >
                Turn on notifications
              </SubtextParagraph>
            </div>
            <div style={{ marginBottom: -5 }}>
              <SwitchToggle
                enabled={notificationPermissionGranted}
                onChange={async () => {
                  await requestNotificationPermission();
                  await registerSubscription();
                }}
              />
            </div>
          </Box>
          <Box
            sx={{
              ml: "16px",
              mr: "16px",
            }}
          >
            <Grid container spacing={2}>
              {BACKPACK_FEATURE_XNFT && (
                <Grid item xs={6}>
                  <ActionCard
                    icon={<WidgetIcon fill="#E33E3F" />}
                    text="Browse the xNFT library"
                    onClick={() => window.open(XNFT_GG_LINK, "_blank")}
                  />
                </Grid>
              )}
              <Grid item xs={6}>
                <ActionCard
                  icon={<TwitterIcon fill="#1D9BF0" />}
                  text="Follow us on Twitter"
                  onClick={() => window.open(TWITTER_LINK, "_blank")}
                />
              </Grid>
              <Grid item xs={6}>
                <ActionCard
                  icon={<DiscordIcon fill="#5865F2" />}
                  text="Join the Discord community"
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
            label="Finish"
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

function PinNotification() {
  const theme = useCustomTheme();

  return (
    <div
      style={{
        background: theme.custom.colors.brandColor,
        paddingLeft: "24px",
        paddingRight: "24px",
        paddingTop: "16px",
        paddingBottom: "16px",
        color: theme.custom.colors.nav,
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
          <ExtensionIcon fill={theme.custom.colors.nav} />
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
          <PinIcon fill={theme.custom.colors.nav} />
        </div>
      </div>
    </div>
  );
}

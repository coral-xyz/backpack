import type { ReactNode } from "react";
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
} from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";

import { Header, SubtextParagraph } from "../../common";
import { ActionCard } from "../../common/Layout/ActionCard";
import { AppStoreIcon } from "../Icon";

export function SetupComplete({ onClose }: { onClose: () => void }) {
  const theme = useCustomTheme();

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
            <Header text="You've set up Backpack!" />
            <SubtextParagraph
              style={{
                marginBottom: "25px",
              }}
            >
              We recommend downloading a few xNFTs to get started.
            </SubtextParagraph>
          </Box>
          <Box
            sx={{
              ml: "16px",
              mr: "16px",
            }}
          >
            <Grid container spacing={1} columns={1}>
              {BACKPACK_FEATURE_XNFT ? <Grid item xs={6}>
                <CallToAction
                  icon={<AppStoreIcon />}
                  title="Browse the xNFT library"
                  onClick={() => window.open(XNFT_GG_LINK, "_blank")}
                  />
              </Grid> : null}
              <Grid item xs={6}>
                <CallToAction
                  icon={<TwitterIcon fill="#1D9BF0" />}
                  title="Follow us on Twitter"
                  onClick={() => window.open(TWITTER_LINK, "_blank")}
                />
              </Grid>
              <Grid item xs={6}>
                <CallToAction
                  icon={<DiscordIcon fill="#5865F2" />}
                  title="Join Discord"
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
            label="Visit xnft.gg"
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
  const theme = useCustomTheme();
  return (
    <Button
      disableRipple
      onClick={onClick}
      style={{
        padding: 0,
        textTransform: "none",
        border: `${theme.custom.colors.borderFull}`,
        borderRadius: "12px",
        background: theme.custom.colors.nav,
        width: "100%",
      }}
    >
      <Card
        sx={{
          p: 1,
          color: theme.custom.colors.fontColor,
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

import { Typography, Box, Grid } from "@mui/material";
import { useCustomTheme } from "@coral-xyz/themes";
import { Header, SubtextParagraph, PrimaryButton } from "../common";
import { ActionCard } from "../Layout/ActionCard";
import {
  PinIcon,
  ExtensionIcon,
  WidgetIcon,
  TwitterIcon,
  CashIcon,
  DiscordIcon,
} from "../common/Icon";

export function SetupComplete({ onClose }: { onClose: () => void }) {
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
          color: "theme.custom.colors.nav",
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
                marginBottom: "24px",
              }}
            >
              Now get started exploring what your Backpack can do.
            </SubtextParagraph>
          </Box>
          <Box
            sx={{
              ml: "16px",
              mr: "16px",
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <ActionCard
                  icon={<CashIcon />}
                  text="Fund your Backpack"
                  onClick={() => {}}
                />
              </Grid>
              <Grid item xs={6}>
                <ActionCard
                  icon={<WidgetIcon />}
                  text="Browse the xNFT library"
                  onClick={() =>
                    window.open("https://backpack.app/library", "_blank")
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <ActionCard
                  icon={<TwitterIcon />}
                  text="Follow us on Twitter"
                  onClick={() =>
                    window.open("https://twitter.com/xNFT_Backpack", "_blank")
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <ActionCard
                  icon={<DiscordIcon />}
                  text="Join the Discord community"
                  onClick={() => {}} // TODO:
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
          <PrimaryButton label="Finish" onClick={onClose} />
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
        background: theme.custom.colors.activeNavButton,
        paddingLeft: "24px",
        paddingRight: "24px",
        paddingTop: "16px",
        paddingBottom: "16px",
        color: theme.custom.colors.fontColor,
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
          <ExtensionIcon />
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
          <PinIcon />
        </div>
      </div>
    </div>
  );
}

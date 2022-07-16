import { Box, Grid } from "@mui/material";
import { Header, SubtextParagraph, PrimaryButton } from "../common";
import { ActionCard } from "../Layout/ActionCard";
import { WidgetIcon, TwitterIcon, CashIcon, DiscordIcon } from "../Icon";

export function SetupComplete({ onClose }: { onClose: () => void }) {
  return (
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
                onClick={() => {}}
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
  );
}

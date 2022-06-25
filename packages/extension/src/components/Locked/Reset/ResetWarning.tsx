import { useEphemeralNav } from "@coral-xyz/recoil";
import { Box, Grid } from "@mui/material";
import {
  Header,
  SubtextParagraph,
  PrimaryButton,
  SecondaryButton,
} from "../../common";
import { MnemonicInput } from "./MnemonicInput";

export function ResetWarning({ closeDrawer }: { closeDrawer: () => void }) {
  const nav = useEphemeralNav();

  const next = () => {
    nav.push(<MnemonicInput closeDrawer={closeDrawer} />);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box
        sx={{
          marginTop: "16px",
          marginLeft: "24px",
          marginRight: "24px",
        }}
      >
        <WarningLogo />
        <Header text="Reset your secret recovery phrase" />
        <SubtextParagraph>
          This will remove all wallets and replace them with a new wallet.
          Ensure you have your existing secret recovery phrase and private keys
          saved.
        </SubtextParagraph>
      </Box>
      <Box
        sx={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ width: "167.5px" }}>
          <SecondaryButton label="Cancel" onClick={closeDrawer} />
        </Box>
        <Box sx={{ width: "167.5px" }}>
          <PrimaryButton label="Next" onClick={next} />
        </Box>
      </Box>
    </Box>
  );
}

export function WarningLogo({ className }: { className?: string }) {
  return (
    <Box sx={{ display: "block", textAlign: "center", mb: "12px" }}>
      <svg
        width="46"
        height="40"
        viewBox="0 0 46 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.43 39.8421H40.57C44.1633 39.8421 46.4033 35.9455 44.6067 32.8421L27.0367 2.48546C25.24 -0.617874 20.76 -0.617874 18.9633 2.48546L1.39333 32.8421C-0.403335 35.9455 1.83666 39.8421 5.43 39.8421ZM23 23.5088C21.7167 23.5088 20.6667 22.4588 20.6667 21.1755V16.5088C20.6667 15.2255 21.7167 14.1755 23 14.1755C24.2833 14.1755 25.3333 15.2255 25.3333 16.5088V21.1755C25.3333 22.4588 24.2833 23.5088 23 23.5088ZM25.3333 32.8421H20.6667V28.1755H25.3333V32.8421Z"
          fill="#A1A1AA"
        />
      </svg>
    </Box>
  );
}

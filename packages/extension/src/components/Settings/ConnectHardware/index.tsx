import { useCustomTheme } from "@coral-xyz/themes";
import { Box } from "@mui/material";
import { useEphemeralNav } from "@coral-xyz/recoil";
import { Header, PrimaryButton, SubtextParagraph } from "../../common";
import { SearchingHardware } from "./SearchingHardware";

export function ConnectHardware() {
  const nav = useEphemeralNav();

  const next = () => {
    nav.push(<SearchingHardware />);
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
        <HardwareWalletIcon />
        <Header text="Connect a hardware wallet" />
        <SubtextParagraph>
          Use your hardware wallet with Backpack.
        </SubtextParagraph>
      </Box>
      <Box
        sx={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <PrimaryButton label="Next" onClick={next} />
      </Box>
    </Box>
  );
}

export function HardwareWalletIcon() {
  return (
    <Box sx={{ display: "block", textAlign: "center", mb: "12px" }}>
      <svg
        width="48"
        height="38"
        viewBox="0 0 48 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M38 0.333984H9.99999C4.84332 0.333984 0.666656 4.51065 0.666656 9.66732V28.334C0.666656 33.4907 4.84332 37.6673 9.99999 37.6673H38C43.1567 37.6673 47.3333 33.4907 47.3333 28.334V9.66732C47.3333 4.51065 43.1567 0.333984 38 0.333984ZM33.66 23.1307C33.1 23.5973 32.33 23.784 31.6067 23.5973L5.68332 17.2507C6.38332 15.5473 8.03999 14.334 9.99999 14.334H38C39.5633 14.334 40.94 15.1273 41.8033 16.294L33.66 23.1307ZM9.99999 5.00065H38C40.5667 5.00065 42.6667 7.10065 42.6667 9.66732V10.9507C41.29 10.1573 39.7033 9.66732 38 9.66732H9.99999C8.29666 9.66732 6.70999 10.1573 5.33332 10.9507V9.66732C5.33332 7.10065 7.43332 5.00065 9.99999 5.00065Z"
          fill="#A1A1AA"
        />
      </svg>
    </Box>
  );
}

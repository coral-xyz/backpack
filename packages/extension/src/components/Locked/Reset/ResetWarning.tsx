import { useEffect } from "react";
import { Box } from "@mui/material";
import { useEphemeralNav } from "@coral-xyz/recoil";
import { ResetSuccess } from "./ResetSuccess";
import {
  Header,
  HeaderIcon,
  SubtextParagraph,
  DangerButton,
  SecondaryButton,
} from "../../common";
import { WarningIcon } from "../../Icon";

export function ResetWarning({ onClose }: { onClose: () => void }) {
  const nav = useEphemeralNav();
  const onNext = () => {
    nav.push(<ResetSuccess />);
  };
  useEffect(() => {
    nav.setTitle("");
    nav.setStyle({ borderBottom: "none" });
    nav.setNavButtonRight(undefined);
  }, []);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ margin: "0 24px" }}>
        <HeaderIcon icon={<WarningIcon />} />
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
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ width: "167.5px" }}>
          <SecondaryButton label="Cancel" onClick={onClose} />
        </Box>
        <Box sx={{ width: "167.5px" }}>
          <DangerButton label="Reset" onClick={() => onNext()} />
        </Box>
      </Box>
    </Box>
  );
}

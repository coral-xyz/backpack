import {
  DangerButton,
  QuestionIcon,
  SecondaryButton,
} from "@coral-xyz/react-common";
import { KeyringStoreStateEnum, useKeyringStoreState } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Box } from "@mui/material";

import { Header, HeaderIcon, SubtextParagraph } from "../../common";
import { useNavigation } from "../../common/Layout/NavStack";

export function ResetWelcome({ onClose }: { onClose: () => void }) {
  const keyringStoreState = useKeyringStoreState();
  const isLocked = keyringStoreState === KeyringStoreStateEnum.Locked;

  const theme = useCustomTheme();
  const nav = useNavigation();
  const onNext = () => {
    nav.push("reset-warning");
  };
  const onPop = () => {
    nav.pop();
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
      <Box sx={{ margin: "0 24px" }}>
        <HeaderIcon icon={<QuestionIcon />} />
        <Header text="Forgot your password?" />
        <SubtextParagraph>
          We can’t recover your password as it is only stored on your computer.
          You can try more passwords or reset your wallet with the secret
          recovery phrase.
        </SubtextParagraph>
      </Box>
      <Box
        sx={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
        }}
      >
        <Box sx={{ mb: "16px" }}>
          <SecondaryButton
            label="Try More Passwords"
            onClick={isLocked ? onClose : onPop}
            style={{
              border: theme.custom.colors.borderButton,
            }}
          />
        </Box>
        <DangerButton label="Reset Backpack" onClick={onNext} />
      </Box>
    </Box>
  );
}

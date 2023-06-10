import type { CSSProperties } from "react";
import { PrimaryButton, SecondaryButton } from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";
import { Box } from "@mui/material";

import { Header, SubtextParagraph } from "../../common";

export const NotificationsPermission = ({ onNext }: { onNext: () => void }) => {
  const theme = useCustomTheme();

  const requestNotificationPermission = async (): Promise<boolean> => {
    const permission = await window.Notification.requestPermission();
    return permission === "granted";
  };

  const handleAllow = async () => {
    await requestNotificationPermission();

    onNext();
  };

  const handleDisable = () => {
    onNext();
  };

  return (
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
        <Box sx={{ mt: "24px", mx: "24px" }}>
          <Header text="Allow notifications?" />
          <SubtextParagraph style={{ marginBottom: "20px" }}>
            These appear for messages and friend requests.
          </SubtextParagraph>
        </Box>
        <Box sx={{ mx: "20px" }}>
          <SkeletonNotifications style={{ width: "100%" }} />
        </Box>
      </Box>
      <Box sx={{ mx: "16px", mb: "16px", display: "flex", gap: "10px" }}>
        <SecondaryButton
          label="Disable"
          style={{ background: "transparent" }}
          buttonLabelStyle={{ fontWeight: 600 }}
          onClick={handleDisable}
        />
        <PrimaryButton
          label="Allow"
          buttonLabelStyle={{ fontWeight: 600 }}
          onClick={handleAllow}
        />
      </Box>
    </Box>
  );
};

const SkeletonNotifications = ({ style }: { style?: CSSProperties }) => (
  <svg
    style={{ height: "inherit", width: "inherit", ...style }}
    width="343"
    height="194"
    viewBox="0 0 343 194"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_18596_144803)">
      <rect width="343" height="64" fill="white" />
      <circle cx="28" cy="32" r="16" fill="#DFE0E6" />
      <rect x="52" y="20" width="72" height="8" rx="4" fill="#DFE0E6" />
      <rect x="52" y="36" width="176" height="8" rx="4" fill="#DFE0E6" />
      <rect x="291" y="20" width="40" height="8" rx="4" fill="#DFE0E6" />
      <g opacity="0.5">
        <rect
          width="343"
          height="64"
          transform="translate(0 65)"
          fill="white"
        />
        <circle cx="28" cy="97" r="16" fill="#DFE0E6" />
        <rect x="52" y="85" width="72" height="8" rx="4" fill="#DFE0E6" />
        <rect x="52" y="101" width="176" height="8" rx="4" fill="#DFE0E6" />
        <rect x="291" y="85" width="40" height="8" rx="4" fill="#DFE0E6" />
      </g>
      <g opacity="0.5">
        <rect
          width="343"
          height="64"
          transform="translate(0 130)"
          fill="white"
        />
        <circle cx="28" cy="162" r="16" fill="#DFE0E6" />
        <rect x="52" y="150" width="72" height="8" rx="4" fill="#DFE0E6" />
        <rect x="52" y="166" width="176" height="8" rx="4" fill="#DFE0E6" />
        <rect x="291" y="150" width="40" height="8" rx="4" fill="#DFE0E6" />
      </g>
    </g>
    <rect
      x="1"
      y="1"
      width="341"
      height="192"
      rx="11"
      stroke="#F0F0F2"
      strokeWidth="2"
    />
    <defs>
      <clipPath id="clip0_18596_144803">
        <rect width="343" height="194" rx="12" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

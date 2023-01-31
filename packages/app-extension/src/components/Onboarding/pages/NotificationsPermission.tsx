import { useState } from "react";
import { PrimaryButton, SecondaryButton } from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";
import { Box } from "@mui/material";

import {
  registerNotificationServiceWorker,
  saveSubscription,
} from "../../../permissions/utils";
import { Header, SubtextParagraph } from "../../common";

export const NotificationsPermission = ({ onNext }: { onNext: () => void }) => {
  const theme = useCustomTheme();

  const requestNotificationPermission = async (): Promise<boolean> => {
    const permission = await window.Notification.requestPermission();
    return permission === "granted";
  };

  const registerSubscription = async () => {
    try {
      const sub = await registerNotificationServiceWorker();
      if (!sub) {
        // Set appropriate app states
        return;
      }
      await saveSubscription(sub);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAllow = async () => {
    const success = await requestNotificationPermission();
    if (success) {
      await registerSubscription();
    }
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
        <Box sx={{ mt: "24px", ml: "24px", mr: "24px" }}>
          <Header text="Allow notifications?" />
          <SubtextParagraph style={{ marginBottom: 0 }}>
            Find out when you have:
          </SubtextParagraph>
          <div style={{ marginBottom: "20px" }}>
            <ul
              style={{
                marginTop: 0,
                paddingLeft: "25px",
                color: theme.custom.colors.subtext,
              }}
            >
              <li>New messages</li>
              <li>Contact requests</li>
            </ul>
          </div>
          <SubtextParagraph>
            You can change this later in preferences.
          </SubtextParagraph>
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

import { useEffect, useState } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";

import { PermissionsContent } from "./PermissionsContent";
import { registerNotificationServiceWorker, saveSubscription } from "./utils";

export const NotificationPermissions = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [inProgress, setInProgress] = useState(true);

  const requestNotificationPermission = async () => {
    const permission = await window.Notification.requestPermission();
    if (permission !== "granted") {
      setPermissionGranted(false);
      setInProgress(false);
      throw new Error("Permission not granted for Notification");
    }
  };

  const registerSubscription = async () => {
    try {
      const sub = await registerNotificationServiceWorker();
      if (!sub) {
        return;
      }
      await saveSubscription(sub);
      setPermissionGranted(true);
    } catch (err) {
      console.error(err);
      setPermissionGranted(false);
    } finally {
      setInProgress(false);
    }
  };

  const init = async () => {
    await requestNotificationPermission();
    await registerSubscription();
  };

  useEffect(() => {
    init();
  }, []);

  if (inProgress) {
    return (
      <PermissionsContent
        title="Allow Notifications"
        subtitle1="Please allow Backpack access to notifications."
        icon={
          <NotificationsIcon
            style={{ width: 50, height: 50 }}
            fill="#8F929E"
          />
        }
        backgroundColor="#DFE0E6"
      />
    );
  }

  if (!permissionGranted) {
    return (
      <PermissionsContent
        title="Access Blocked"
        subtitle1="To give Backpack notification access,"
        subtitle2="check your browser or device settings"
        icon={<NotificationsOffIcon style={{ width: 50, height: 50 }} />}
        backgroundColor="#DFE0E6"
      />
    );
  }

  return (
    <PermissionsContent
      title="Access Granted"
      subtitle1="You have granted notification access"
      icon={
        <NotificationsIcon
          style={{ width: 50, height: 50, color: "#35A63A" }}
        />
      }
      backgroundColor="rgba(53, 166, 58, 0.1)"
    />
  );
};

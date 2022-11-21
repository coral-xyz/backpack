import { useEffect, useState } from "react";
import { PermissionsPage } from "./PermissionsPage";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { useUsername } from "@coral-xyz/recoil";

const BACKPACK_NOTIFICATION_PUBKEY =
  "BJ6je9D4-ZJUH1yxTCRT01ILw07-YZcpAEk5hxpnPnEXJJ8WjE9BYf_fTPXNGRM1yw5C1CZQaCFmUX0gujpf67E";

export const NotificationPermissions = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [inProgress, setInProgress] = useState(true);
  const username = useUsername();

  const requestNotificationPermission = async () => {
    const permission = await window.Notification.requestPermission();
    if (permission !== "granted") {
      setPermissionGranted(false);
      setInProgress(false);
      throw new Error("Permission not granted for Notification");
    }
  };

  const urlB64ToUint8Array = (base64String: any) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const saveSubscription = async (subscription: any) => {
    const response = await fetch(`${BACKEND_API_URL}/notifications/register`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subscription, username: username || "kira" }),
    });
    return response.json();
  };

  const registerSubscription = async () => {
    navigator.serviceWorker.ready.then(async (serviceWorkerRegistration) => {
      // This will be called only once when the service worker is installed for first time.
      const applicationServerKey = urlB64ToUint8Array(
        BACKPACK_NOTIFICATION_PUBKEY
      );
      const options = { applicationServerKey, userVisibleOnly: true };
      return serviceWorkerRegistration.pushManager
        .subscribe(options)
        .then(async function (subscription) {
          if (!subscription) {
            // Set appropriate app states.
            return;
          }
          const response = await saveSubscription(subscription);
          setPermissionGranted(true);
          setInProgress(false);
        })
        .catch(function (err) {
          setPermissionGranted(false);
          setInProgress(false);
        });
    });
  };

  const init = async () => {
    await requestNotificationPermission();
    await registerSubscription();
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <PermissionsPage
      inProgress={inProgress}
      permissionGranted={permissionGranted}
    />
  );
};

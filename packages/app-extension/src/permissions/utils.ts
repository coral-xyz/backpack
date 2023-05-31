import { BACKEND_API_URL } from "@coral-xyz/common";

const BACKPACK_NOTIFICATION_PUBKEY =
  "BJ6je9D4-ZJUH1yxTCRT01ILw07-YZcpAEk5hxpnPnEXJJ8WjE9BYf_fTPXNGRM1yw5C1CZQaCFmUX0gujpf67E";

const urlB64ToUint8Array = (base64String: any) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const registerNotificationServiceWorker = () => {
  return navigator.serviceWorker.ready.then(
    async (serviceWorkerRegistration) => {
      // This will be called only once when the service worker is installed for first time.
      const applicationServerKey = urlB64ToUint8Array(
        BACKPACK_NOTIFICATION_PUBKEY
      );
      const options = { applicationServerKey, userVisibleOnly: true };
      return serviceWorkerRegistration.pushManager.subscribe(options);
    }
  );
};

export const unregisterNotificationServiceWorker = () => {
  return navigator.serviceWorker.ready.then(
    async (serviceWorkerRegistration) => {
      const applicationServerKey = urlB64ToUint8Array(
        BACKPACK_NOTIFICATION_PUBKEY
      );
      const sub = await serviceWorkerRegistration.pushManager.getSubscription();
      if (sub && sub.options.applicationServerKey === applicationServerKey) {
        await sub.unsubscribe();
      }
    }
  );
};

export const hasActiveSubscription = async (): Promise<boolean> => {
  const response = await fetch(
    `${BACKEND_API_URL}/notifications/subscriptions`
  );
  const json = await response.json();
  return json.auth_notification_subscriptions
    ? json.auth_notification_subscriptions.length > 0
    : false;
};

export const deleteSubscription = async () => {
  const response = await fetch(`${BACKEND_API_URL}/notifications`, {
    method: "DELETE",
  });
  return response.json();
};

export const saveSubscription = async (subscription: any) => {
  const response = await fetch(`${BACKEND_API_URL}/notifications/register`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ subscription }),
  });
  return response.json();
};

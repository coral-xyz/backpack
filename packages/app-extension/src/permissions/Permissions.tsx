import { useEffect, useState } from "react";
import { Checkmark } from "../components/Unlocked/Settings/Preferences/Ethereum/Connection";
import { WithTheme } from "../components/common/WithTheme";
import { RecoilRoot } from "recoil";

const Permissions = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);

  const fetchPermissions = async () => {
    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setPermissionGranted(true);
      stream.getTracks().forEach((x) => x.stop());
    } catch (err) {
      console.error(err);
      setPermissionGranted(false);
    }
  };

  useEffect(() => {
    async function getPermissions() {
      //@ts-ignore
      const permission = await window.Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Permission not granted for Notification");
      }
    }
    getPermissions();
  }, []);

  const registerServiceWorker = async () => {
    // const swRegistration = await navigator.serviceWorker.register(
    //   "assets/service.js"
    // );

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
      console.log("inside save subscription");
      const SERVER_URL = "http://localhost:8787/notifications/register";
      const response = await fetch(SERVER_URL, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscription }),
      });
      return response.json();
    };

    navigator.serviceWorker.ready.then(async (serviceWorkerRegistration) => {
      console.log(serviceWorkerRegistration);
      console.log("ready!!");
      // This will be called only once when the service worker is installed for first time.
      try {
        const applicationServerKey = urlB64ToUint8Array(
          "BA_9ntbAGy7SAn9oUzkGiWQXqCqc1BQs-7OK6C4fMkC7Y0nWiPqhNPder3-nklzley4IetxjSCd6cI8jHgZ01us"
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
            console.log(response);
          })
          .catch(function (err) {
            console.log("error in subcription .. " + err);
          });
      } catch (err) {
        console.log("Error", err);
      }
    });
    // self.addEventListener("push", function(event) {
    //   if (event.data) {
    //     console.log("Push event!! ", event.data.text());
    //   } else {
    //     console.log("Push event but no data");
    //   }
    // })

    ////////////

    // return swRegistration;
  };
  const showLocalNotification = (
    title: string,
    body: any,
    swRegistration: any
  ) => {
    console.log("inside showlocalNotification");
    const options = {
      body,
      // here you can add more properties like icon, image, vibrate, etc.
    };
    swRegistration.showNotification(title, options);
  };
  const requestNotificationPermission = async () => {
    const permission = await window.Notification.requestPermission();
    // value of permission can be 'granted', 'default', 'denied'
    // granted: user has accepted the request
    // default: user has dismissed the notification permission popup by clicking on x
    // denied: user has denied the request.
    if (permission !== "granted") {
      throw new Error("Permission not granted for Notification");
    }
  };

  const fn = async () => {
    fetchPermissions();
    const permission = await requestNotificationPermission();
    const swRegistration = await registerServiceWorker();
    // showLocalNotification('This is title', 'this is the message', swRegistration);
  };

  useEffect(() => {
    console.log("inside effect");
    fn();
  }, []);

  return (
    <RecoilRoot>
      <WithTheme>
        <div
          style={{
            width: "100vw",
            height: "100vh",
            background:
              "radial-gradient(farthest-side at 0 0, #6360FF, rgba(255,255,255,0) 100%),radial-gradient(farthest-side at 100% 0, #C061F7, rgba(255,255,255,0) 100%),radial-gradient(farthest-side at 0 100%, #28DBD1 25%, rgba(255,255,255,0) 100%),radial-gradient(farthest-side at 100% 100%, #FE6F5C 25%, rgba(255,255,255,0) 100%)",
          }}
        >
          {!permissionGranted && (
            <img
              src="/assets/will.png"
              style={{
                transform: "rotate(10deg) scaleX(-1)",
                marginLeft: 350,
                maxHeight: "90vh",
              }}
            ></img>
          )}
          <div>
            {permissionGranted && (
              <div style={{ fontSize: 50, paddingTop: "45vh" }}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <div>
                    <div>Permissions granted</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </WithTheme>
    </RecoilRoot>
  );
};

export default Permissions;

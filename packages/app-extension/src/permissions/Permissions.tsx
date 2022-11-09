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
      console.error("hi there");
      setPermissionGranted(true);
      stream.getTracks().forEach((x) => x.stop());
    } catch (err) {
      console.error(err);
      setPermissionGranted(false);
    }
  };
  useEffect(() => {
    fetchPermissions();
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

import { RecoilRoot } from "recoil";

import { WithTheme } from "../components/common/WithTheme";

import { CameraPermissions } from "./CameraPermissions";
import { NotificationPermissions } from "./NotificationPermissions";

const Permissions = () => {
  const params = new URLSearchParams(window.location.search);
  const notifications = params.get("notifications") === "true" || false;

  if (notifications) {
    return <NotificationPermissions />;
  }
  return <CameraPermissions />;
};

function PermissionWithContext() {
  return (
    <RecoilRoot>
      <WithTheme>
        <Permissions />
      </WithTheme>
    </RecoilRoot>
  );
}

export default PermissionWithContext;

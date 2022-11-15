import { WithTheme } from "../components/common/WithTheme";
import { RecoilRoot } from "recoil";
import { useLocation, Routes } from "react-router-dom";
import { NotificationPermissions } from "./NotificationPermissions";
import { CameraPermissions } from "./CameraPermissions";

const Permissions = () => {
  const params = new URLSearchParams(window.location.search);
  const notifications = params.get("notifications") || false;

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

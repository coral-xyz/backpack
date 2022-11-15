import { useEffect, useState } from "react";
import { WithTheme } from "../components/common/WithTheme";
import { RecoilRoot } from "recoil";
import {
  useSearchParams,
} from "react-router-dom";
import { NotificationPermissions } from "./NotificationPermissions";
import { CameraPermissions } from "./CameraPermissions";

const Permissions = () => {
  const [searchParams] = useSearchParams();
  const notifications = searchParams.get("notifications");
  
  if (notifications) {
    return <NotificationPermissions />
  }
  return <CameraPermissions />
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

import { useEffect, useState } from "react";

import { CameraOff } from "./icons/CameraOff";
import { CameraOn } from "./icons/CameraOn";
import { PermissionsContent } from "./PermissionsContent";

export const CameraPermissions = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [inProgress, setInProgress] = useState(true);

  const fetchPermissions = async () => {
    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setPermissionGranted(true);
      stream.getTracks().forEach((x) => x.stop());
      setInProgress(false);
    } catch (err) {
      console.error(err);
      setPermissionGranted(false);
      setInProgress(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  if (inProgress) {
    return (
      <PermissionsContent
        marginTop={35}
        title="Allow Camera"
        subtitle1="Please allow Backpack access to your camera."
        subtitle2="This is required to share your video during a call."
        icon={<CameraOn fill="#8F929E" />}
        backgroundColor="#DFE0E6"
      />
    );
  }

  if (!permissionGranted) {
    return (
      <PermissionsContent
        title="Access Blocked"
        subtitle1="To give Backpack camera and microphone access,"
        subtitle2="check your browser or device settings"
        icon={<CameraOff />}
        backgroundColor="#DFE0E6"
      />
    );
  }

  return (
    <PermissionsContent
      marginTop={35}
      title="Access Granted"
      subtitle1="You have granted camera and mic access"
      icon={<CameraOn fill="#35A63A" />}
      backgroundColor="rgba(53, 166, 58, 0.1)"
    />
  );
};

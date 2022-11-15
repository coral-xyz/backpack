import { useEffect, useState } from "react";
import { PermissionsPage } from "./PermissionsPage";

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

  return (
    <PermissionsPage
      inProgress={inProgress}
      permissionGranted={permissionGranted}
    />
  );
};

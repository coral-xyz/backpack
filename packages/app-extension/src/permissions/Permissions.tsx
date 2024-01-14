import { RecoilRoot } from "recoil";

import { WithTheme } from "../components/common/WithTheme";

import { CameraPermissions } from "./CameraPermissions";

const Permissions = () => {
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

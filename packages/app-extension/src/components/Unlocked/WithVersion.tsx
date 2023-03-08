import { useEffect, useState } from "react";
import {
  BACKPACK_CONFIG_GITHUB_RUN_NUMBER,
  BACKPACK_FEATURE_FORCE_LATEST_VERSION,
} from "@coral-xyz/common";
import { EmptyState } from "@coral-xyz/react-common";
import { Block } from "@mui/icons-material";

import { WithDrawer } from "../common/Layout/Drawer";

/**
 * WithVersion does a check to make sure the app is running with the latest version
 * as determinied by a remote worker. If the app is not on the latest version, then
 * we present a drawer to force the user to update.
 */
export function WithVersion({ children }: { children: any }) {
  const [openDrawer, setOpenDrawer] = useState(false);

  useEffect(() => {
    (async () => {
      const { version } = await (
        await fetch("https://version.backpack.workers.dev/")
      ).json();
      if (BACKPACK_FEATURE_FORCE_LATEST_VERSION) {
        let buildNumber: number | undefined;
        try {
          buildNumber = parseInt(BACKPACK_CONFIG_GITHUB_RUN_NUMBER);
          if (buildNumber < version) {
            setOpenDrawer(true);
          }
        } catch (err) {
          // Do nothing because the version is "development".
          setOpenDrawer(true);
        }
      }
    })();
  }, []);

  return (
    <>
      {children}
      <WithDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
        <VersionWarning />
      </WithDrawer>
    </>
  );
}

function VersionWarning() {
  return (
    <div
      style={{
        height: "100%",
      }}
    >
      <EmptyState
        icon={(props: any) => <Block {...props} />}
        title="Please upgrade your Backpack"
        subtitle={`During the duration of the beta program, Backpack
        requires users to use the most up to date version of the extension.`}
      />
    </div>
  );
}

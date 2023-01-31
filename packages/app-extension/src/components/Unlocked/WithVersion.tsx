import { useState, useEffect } from "react";
import {
  BACKPACK_CONFIG_VERSION,
  BACKPACK_FEATURE_FORCE_LATEST_VERSION,
} from "@coral-xyz/common";
import { WithDrawer } from "../common/Layout/Drawer";

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
          buildNumber = parseInt(BACKPACK_CONFIG_VERSION);
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
    <div>
      test here During the duration of the public beta program, Backpack will
      require users to use the most up to date version of the extension. Please
      update your extension or enable auto updating if you have not already. If
      you have, p[lease give some time for the store to update your browser.
      Sometimes updates can take a while to upgrade.
    </div>
  );
}

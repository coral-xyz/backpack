import { Suspense, useEffect, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { Loading } from "@coral-xyz/react-common";
import { useClosePlugin } from "@coral-xyz/recoil";

import { PluginApp } from "../../Unlocked/Apps/Plugin";

import { WithDrawer } from "./Drawer";

export function XnftAppStack() {
  let { xnftAddress } = useParams();
  const [openDrawer, setOpenDrawer] = useState(true);
  const closePlugin = useClosePlugin();
  // const [searchParams] = useSearchParams();

  // const pluginProps = searchParams.get("pluginProps");

  // Auto-lock functionality is dependent on checking if the URL contains
  // "xnftAddress", if this changes then please verify that it still works
  // const { xnftAddress } = JSON.parse(decodeURIComponent(pluginProps ?? "{}"));

  useEffect(() => {
    if (xnftAddress) {
      setOpenDrawer(true);
    }
  }, [xnftAddress]);

  return (
    <WithDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
      <Suspense fallback={<Loading />}>
        {xnftAddress && (
          <PluginApp
            xnftAddress={xnftAddress}
            closePlugin={() => {
              // setOpenDrawer(false);
              setTimeout(closePlugin, 100);
            }}
          />
        )}
      </Suspense>
    </WithDrawer>
  );
}

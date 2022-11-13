import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useBackgroundClient } from "@coral-xyz/recoil";
import {
  TAB_SET,
  UI_RPC_METHOD_NAVIGATION_CURRENT_URL_UPDATE,
} from "@coral-xyz/common";
import { WithDrawer } from "../common/Layout/Drawer";
import { PluginApp } from "./Apps/Plugin";
import { useRecoilValue } from "recoil";
import * as atoms from "@coral-xyz/recoil/dist/esm/atoms";

const ICON_WIDTH = 64;

export function DisplayPlugin() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const background = useBackgroundClient();
  const xnftAddress = searchParams.get("plugin");
  const [openDrawer, setOpenDrawer] = useState(
    xnftAddress !== undefined && xnftAddress !== null
  );

  useEffect(() => {
    setOpenDrawer(xnftAddress !== undefined && xnftAddress !== null);
  }, [xnftAddress]);

  const closePlugin = () => {
    setOpenDrawer(false);
    // Bit of a hack. Would be better to have a callback on the drawer animation closing.
    // Also, there's a potential race condition between this request persisting
    // and the user navigating to another url before that completing. In practice,
    // it's not a problem because this happens so quickly relative to the next
    // user action. If there's a bug, investigate this. :)

    const activeTab = TAB_SET.has(location.pathname.slice(1))
      ? location.pathname.slice(1)
      : null;
    setTimeout(() => {
      searchParams.delete("plugin");
      const newUrl = `${location.pathname}?${searchParams.toString()}`;
      background
        .request({
          method: UI_RPC_METHOD_NAVIGATION_CURRENT_URL_UPDATE,
          params: [newUrl, activeTab],
        })
        .catch(console.error);
    }, 100);
  };

  return (
    <WithDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
      {xnftAddress && (
        <PluginApp xnftAddress={xnftAddress} closePlugin={closePlugin} />
      )}
    </WithDrawer>
  );
}

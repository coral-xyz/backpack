import { Suspense, useEffect, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { Loading } from "@coral-xyz/react-common";
import { PluginManager, useClosePlugin } from "@coral-xyz/recoil";
import { motion } from "framer-motion";

import { PluginApp } from "../../Unlocked/Apps/Plugin";

import { WithDrawer } from "./Drawer";

export function XnftAppStack() {
  let { xnftAddress } = useParams();
  const [openDrawer, setOpenDrawer] = useState(false);
  const closePlugin = useClosePlugin();
  const [searchParams] = useSearchParams();
  const navAction = searchParams.get("nav");

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
    <PluginManager>
      <motion.div
        key={xnftAddress}
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
        variants={XNFT_MOTION}
        initial={!navAction || navAction === "pop" ? {} : "initial"}
        animate={"animate"}
        exit={!navAction || navAction === "push" ? {} : "exit"}
      >
        <Suspense fallback={<Loading />}>
          {xnftAddress && (
            <PluginApp
              xnftAddress={xnftAddress}
              closePlugin={() => {
                closePlugin();
              }}
            />
          )}
        </Suspense>
      </motion.div>
    </PluginManager>
  );
}

const XNFT_MOTION = {
  initial: {
    opacity: 0,
    transform: "translateY(100px)",
  },
  animate: {
    opacity: 1,
    transition: { delay: 0.09 },
    transform: "translateY(0px)",
  },
  exit: {
    transition: { delay: 0.09, duration: 0.1 },
    opacity: 0,
    transform: "translateY(100px)",
  },
};

import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { useTheme } from "@coral-xyz/tamagui";
import { motion } from "framer-motion";

import { PluginApp } from "../../Unlocked/Apps/Plugin";

export function XnftAppStack() {
  let { xnftAddress } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navAction = searchParams.get("nav");
  const theme = useTheme();
  const deepXnftPath = location.pathname.split(xnftAddress ?? "")[1] ?? "";

  return (
    <motion.div
      key={xnftAddress}
      style={{
        background: theme.baseBackgroundL1.val,
        filter: "drop-shadow(5px 5px 10px #666)",
        position: "relative",
        height: "100%",
        minHeight: "600px",
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
      variants={XNFT_MOTION}
      initial={navAction === "pop" ? {} : "initial"}
      animate="animate"
      exit={navAction === "push" ? {} : "exit"}
    >
      <PluginApp xnftAddress={xnftAddress} deepXnftPath={deepXnftPath} />
    </motion.div>
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

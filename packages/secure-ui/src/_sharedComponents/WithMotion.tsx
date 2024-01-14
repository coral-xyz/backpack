import type { ReactNode } from "react";

import { motion } from "framer-motion";

export function WithMotion({
  children,
  inactive,
  id,
}: {
  inactive?: boolean;
  children: ReactNode;
  id: string | number;
}) {
  return (
    <motion.div
      key={id}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        pointerEvents: inactive ? "none" : "auto",
        flex: 1,
      }}
      variants={{
        initial: {
          transition: { delay: 0.0, duration: 0.15 },
          transform: "scale(0.9)",
          opacity: 0,
        },
        animate: {
          transition: { delay: 0.0, duration: 0.15 },
          transform: "scale(1)",
          opacity: 1,
        },
        inactive: {
          transition: { delay: 0.0, duration: 0.15 },
          opacity: 0.5,
        },
        exit: {
          transition: { delay: 0.0, duration: 0.15 },
          transform: "scale(0.9)",
          opacity: 0,
        },
      }}
      initial="initial"
      animate={inactive ? ["animate", "inactive"] : "animate"}
      exit="exit"
    >
      {children}
    </motion.div>
  );
}

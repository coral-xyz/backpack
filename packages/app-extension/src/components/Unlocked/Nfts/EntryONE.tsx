import { useLayoutEffect, useRef, useState } from "react";
import { useOpenPlugin } from "@coral-xyz/recoil";
import { styles } from "@coral-xyz/themes";
import { Skeleton } from "@mui/material";
import Card from "@mui/material/Card";

import { useIsONELive } from "../../../hooks/useIsONELive";

const useStyles = styles((theme) => ({
  blockchainCard: {
    position: "relative",
    marginBottom: "12px",
    marginLeft: "12px",
    marginRight: "12px",
    borderRadius: "12px",
    border: theme.custom.colors.border,
    height: "117px",
    overflow: "hidden",
    backgroundColor: "transparent !important",
    "&:hover": {
      cursor: "pointer",
    },
  },
  imageBackground: {
    position: "relative",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  image: {
    zIndex: "1",
    height: "117px",
    width: "547px",
    backgroundImage: "url(https://xnft.wao.gg/one-entry-bg.png)",
    backgroundSize: "547px 234px",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "0px 0px",
    "&:hover": {
      backgroundPosition: "0px -117px",
    },
  },
  skeleton: {
    position: "absolute",
    zIndex: "0",
    top: "0px",
    left: "0px",
    height: "100%",
    width: "100%",
    transform: "none",
    backgroundColor: theme.custom.colors.balanceSkeleton,
  },
  hidden: {
    visibility: "hidden",
  },
  none: {
    display: "none",
  },
  visuallyHidden: {
    visibility: "hidden",
    position: "absolute",
    top: "0px",
  },
}));

export default function EntryONE() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  const isONELive = useIsONELive();
  const classes = useStyles();
  const openPlugin = useOpenPlugin();

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }
    if (ref.current.complete) {
      setImageLoaded(true);
      return;
    }
    ref.current.onload = () => {
      setImageLoaded(true);
    };
    return () => {
      if (ref.current) {
        ref.current.onload = () => null;
      }
    };
  }, []);

  const isLoading = false || !imageLoaded || isONELive === "loading";

  const openXNFT = () => {
    openPlugin("CkqWjTWzRMAtYN3CSs8Gp4K9H891htmaN1ysNXqcULc8");
  };

  return (
    <Card onClick={openXNFT} className={classes.blockchainCard} elevation={0}>
      <Skeleton
        className={`${classes.skeleton}  ${!isLoading ? classes.none : ""}`}
      ></Skeleton>
      <div
        className={`${classes.imageBackground} ${
          isLoading ? classes.hidden : ""
        }`}
      >
        <div className={`${classes.image}`} />
      </div>
      <img
        ref={ref}
        className={classes.visuallyHidden}
        src="https://xnft.wao.gg/one-entry-bg.png"
      />
    </Card>
  );
}

import React, { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { UI_RPC_METHOD_NAVIGATION_CURRENT_URL_UPDATE } from "@coral-xyz/common";
import {
  useBackgroundClient,
  useOpenPlugin,
  useUpdateSearchParams,
} from "@coral-xyz/recoil";
import { styles } from "@coral-xyz/themes";
import { Skeleton } from "@mui/material";
import Card from "@mui/material/Card";

import { useIsONELive } from "../../../hooks/useIsONELive";

const useStyles = styles((theme) => ({
  blockchainCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "12px",
    marginLeft: "12px",
    marginRight: "12px",
    borderRadius: "12px",
    border: theme.custom.colors.border,
    backgroundColor: "#000",
    height: "117px",
    cursor: "pinter",
    overflow: "hidden",
    "&:hover": {
      cursor: "pointer",
    },
  },
  image: {
    height: "117px",
    width: "547px",
    background: "url(https://xnft.wao.gg/one-entry-bg.png)",
    backgroundSize: "547px 234px",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "0px 0px",
    "&:hover": {
      backgroundPosition: "0px -117px",
    },
  },
  skeletonCard: {
    marginBottom: "12px",
    marginLeft: "12px",
    marginRight: "12px",
    borderRadius: "12px",
    height: "117px",
    padding: "0px",
  },
  skeleton: {
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
}));

export default React.memo(function EntryONE() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isONELive = useIsONELive();
  const classes = useStyles();
  const openPlugin = useOpenPlugin();

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
    };
    img.src = "https://xnft.wao.gg/one-entry-bg.png";
    return () => {
      img.onload = () => null;
    };
  }, []);

  const isLoading = false || !imageLoaded || isONELive === "loading";

  const openXNFT = () => {
    openPlugin("4ekUZj2TKNoyCwnRDstvViCZYkhnhNoWNQpa5bBLwhq4");
  };

  return (
    <Card
      onClick={isLoading ? () => {} : openXNFT}
      className={isLoading ? classes.skeletonCard : classes.blockchainCard}
      elevation={0}
    >
      <Skeleton
        className={`${classes.skeleton} ${!isLoading ? classes.none : ""}`}
      ></Skeleton>
      <div
        className={`${classes.image} ${isLoading ? classes.hidden : ""}`}
      ></div>
    </Card>
  );
});

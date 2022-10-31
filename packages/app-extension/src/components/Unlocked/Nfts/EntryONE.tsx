import Card from "@mui/material/Card";
import { styles } from "@coral-xyz/themes";
import { Skeleton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useBackgroundClient, useUsername } from "@coral-xyz/recoil";
import { UI_RPC_METHOD_NAVIGATION_CURRENT_URL_UPDATE } from "@coral-xyz/common";
import { useLocation } from "react-router-dom";
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
    border: theme.custom.colors.borderFull,
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
  },
  hidden: {
    visibility: "hidden",
  },
  none: {
    display: "none",
  },
}));

export default function EntryONE() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isONELive = useIsONELive();
  const classes = useStyles();
  const background = useBackgroundClient();
  const location = useLocation();

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
    };
    img.src = "https://xnft.wao.gg/one-entry-bg.png";
  }, []);

  const isLoading = false || !imageLoaded || isONELive === "loading";

  const openXNFT = () => {
    // Update the URL to use the plugin.
    //
    // This will do two things
    //
    // 1. Update and persist the new url. Important so that if the user
    //    closes/re-opens the app, the plugin opens up immediately.
    // 2. Cause a reload of this route with the plguin url in the search
    //    params, which will trigger the drawer to activate.
    //
    const newUrl = `${location.pathname}${
      location.search
    }&plugin=${encodeURIComponent(
      "4ekUZj2TKNoyCwnRDstvViCZYkhnhNoWNQpa5bBLwhq4"
    )}`;
    background
      .request({
        method: UI_RPC_METHOD_NAVIGATION_CURRENT_URL_UPDATE,
        params: [newUrl],
      })
      .catch(console.error);
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
}

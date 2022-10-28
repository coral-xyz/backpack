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
}));

export default function EntryONE() {
  const isONELive = useIsONELive();
  const classes = useStyles();
  const background = useBackgroundClient();
  const location = useLocation();

  if (isONELive === "loading") {
    return (
      <Card className={classes.skeletonCard} elevation={0}>
        <Skeleton className={classes.skeleton}></Skeleton>
      </Card>
    );
  }

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
    <Card onClick={openXNFT} className={classes.blockchainCard} elevation={0}>
      <div className={classes.image}></div>
    </Card>
  );
}

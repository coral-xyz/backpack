import Card from "@mui/material/Card";
import { styles } from "@coral-xyz/themes";
import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useBackgroundClient, useUsername } from "@coral-xyz/recoil";
import { UI_RPC_METHOD_NAVIGATION_CURRENT_URL_UPDATE } from "@coral-xyz/common";
import { useLocation } from "react-router-dom";
import { East } from "@mui/icons-material";

const useStyles = styles((theme) => ({
  blockchainCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "inherit",
    marginBottom: "12px",
    marginLeft: "12px",
    marginRight: "12px",
    borderRadius: "12px",
    border: theme.custom.colors.borderFull,
    height: "117px",
    background: "url(https://xnft.wao.gg/one-entry-bg.png)",
    backgroundSize: "347px 234px",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "0px 0px",
    cursor: "pointer",
    "&:hover": {
      backgroundPosition: "0px -117px",
    },
  },

  cta: {
    fontFamily: theme.fontFamily,
    color: "#fff",
    padding: "16px",
    fontSize: "16px",
    lineHeight: "24px",
  },

  arrow: {
    top: "4px",
    height: "19px",
    position: "relative",
    left: "-1px",
  },
}));

const isLiveCheck = fetch("https://xnft.wao.gg/api/isLive")
  .then((r) => r.json())
  .catch(() => ({ isLive: false }));

export default function EntryONE() {
  const [isLive, setIsLive] = useState(false);
  const classes = useStyles();
  const background = useBackgroundClient();
  const location = useLocation();

  useEffect(() => {
    isLiveCheck.then((response) => {
      setIsLive(response.isLive);
    });
  }, []);

  if (!isLive) {
    return null;
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
    <Card
      onClick={openXNFT}
      className={classes.blockchainCard}
      elevation={0}
    ></Card>
  );
}

import { useLayoutEffect, useRef, useState } from "react";
import { isOneLive, useOpenPlugin } from "@coral-xyz/recoil";
import { styles as makeStyles } from "@coral-xyz/themes";
import { Skeleton } from "@mui/material";
import Card from "@mui/material/Card";
import { useRecoilValue } from "recoil";

import type { AllWalletCollections } from "./NftTable";

const useStyles = makeStyles((theme) => ({
  blockchainCard: {
    position: "relative",
    marginBottom: "12px",
    marginLeft: "12px",
    marginRight: "12px",
    borderRadius: "12px",
    border: theme.custom.colors.border,
    height: "117px",
    overflow: "hidden",
    pointerEvents: "all",
    backgroundColor: "transparent !important",
    "&:hover": {
      cursor: "pointer",
    },
  },
  imageBackground: {
    zIndex: 2,
    position: "relative",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    pointerEvents: "all",
  },
  image: {
    zIndex: 1,
    position: "relative",
    height: "117px",
    width: "547px",
    backgroundSize: "547px 234px",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "0px 0px",
    pointerEvents: "all",
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
    pointerEvents: "none",
    backgroundColor: theme.custom.colors.balanceSkeleton,
  },
  hidden: {
    visibility: "hidden",
  },
  none: {
    display: "none",
    pointerEvents: "none",
  },
  visuallyHidden: {
    zIndex: -1,
    pointerEvents: "none",
    visibility: "hidden",
    position: "absolute",
    top: "1000px",
  },
}));

export default function EntryONE({
  allWalletCollections,
}: {
  allWalletCollections: AllWalletCollections | null;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  const oneLive = useRecoilValue(isOneLive);
  const classes = useStyles();
  const openPlugin = useOpenPlugin();

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }
    const current = ref.current;
    if (current.complete) {
      setImageLoaded(true);
      return;
    }
    current.onload = () => {
      setImageLoaded(true);
    };
    return () => {
      if (current) {
        current.onload = () => null;
      }
    };
  }, []);

  const isLoading = false || !imageLoaded;

  const hasMadNft = !!allWalletCollections?.find((wallet) => {
    return !!wallet.collections?.find((collection) => {
      return (
        collection.metadataCollectionId === oneLive.madladsCollection &&
        collection.itemIds.length > 0
      );
    });
  });

  const hasWLNft = !!allWalletCollections?.find((wallet) => {
    return !!wallet.collections?.find((collection) => {
      return (
        collection.metadataCollectionId === oneLive.wlCollection &&
        collection.itemIds.length > 0
      );
    });
  });

  const banner =
    hasMadNft && oneLive.hasMadladBanner
      ? oneLive.hasMadladBanner
      : hasWLNft && oneLive.hasWLBanner
      ? oneLive.hasWLBanner
      : oneLive.banner;

  const openXNFT = () => {
    if (oneLive.isLive) {
      openPlugin("CkqWjTWzRMAtYN3CSs8Gp4K9H891htmaN1ysNXqcULc8");
    }
  };

  return (
    <Card onClick={openXNFT} className={classes.blockchainCard} elevation={0}>
      <Skeleton
        className={`${classes.skeleton}  ${!isLoading ? classes.none : ""}`}
      />
      <img ref={ref} className={classes.visuallyHidden} src={banner} />
      <div
        className={`${classes.imageBackground} ${
          isLoading ? classes.hidden : ""
        }`}
      >
        <div
          className={`${classes.image}`}
          style={{
            backgroundImage: `url(${banner})`,
          }}
        />
      </div>
    </Card>
  );
}

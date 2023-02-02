import { useRef, useState } from "react";
import { OFFLINE_IMAGES } from "@coral-xyz/common";
import { useFeatureGates } from "@coral-xyz/recoil";

import { ProxyImage } from "./ProxyImage";

export const LocalImage = (props) => {
  const featureGates = useFeatureGates();

  return (
    <ProxyImage
      src={
        featureGates[OFFLINE_IMAGES]
          ? localStorage.getItem(`img-${props.src}`) || props.src
          : props.src
      }
      onClick={props.onClick}
      alt={props.alt}
      className={props.className}
      style={props.style}
    />
  );
};

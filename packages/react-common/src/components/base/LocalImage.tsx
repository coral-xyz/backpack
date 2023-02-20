import { OFFLINE_IMAGES } from "@coral-xyz/common";
import { useFeatureGates } from "@coral-xyz/recoil";

import { ProxyImage } from "./ProxyImage";

export const LocalImage = (props) => {
  const featureGates = useFeatureGates();
  const localSrc = localStorage.getItem(props.localKey ?? `img-${props.src}`);

  return (
    <ProxyImage
      src={featureGates[OFFLINE_IMAGES] ? localSrc || props.src : props.src}
      onClick={props.onClick}
      alt={props.alt}
      className={props.className}
      style={props.style}
      loadingStyles={props.loadingStyles}
    />
  );
};

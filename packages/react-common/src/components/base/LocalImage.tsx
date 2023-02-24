import { useEffect, useState } from "react";
import { LocalImageManager } from "@coral-xyz/db";

import { ProxyImage } from "./ProxyImage";

export const LocalImage = (props) => {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (props.src) {
      try {
        const parsedEl = JSON.parse(
          localStorage.getItem(`image-${props.src}`) || ""
        );
        LocalImageManager.getInstance().addToQueue({
          image: parsedEl.image,
        });
        setImageUrl(parsedEl?.url || props.src);
      } catch (e) {
        setImageUrl(props.src);
      }
    }
  }, [props.src]);

  return (
    <ProxyImage
      src={imageUrl}
      onClick={props.onClick}
      alt={props.alt}
      className={props.className}
      style={props.style}
      loadingStyles={props.loadingStyles}
    />
  );
};

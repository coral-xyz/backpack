import React, { useLayoutEffect, useRef } from "react";
import { proxyImageUrl } from "@coral-xyz/common";
import { Skeleton } from "@mui/material";

type ImgProps = React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>;
export const ProxyImage = React.memo(function ProxyImage({
  removeOnError,
  loadingStyles,
  ...imgProps
}: {
  removeOnError?: boolean;
  loadingStyles?: React.CSSProperties;
} & ImgProps) {
  const placeholderRef = useRef<HTMLSpanElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    if (imageRef.current?.complete) {
      imageRef.current.style.position = "inherit";
      imageRef.current.style.top = "inherit";
      imageRef.current.style.visibility = "visible";
      if (placeholderRef.current) {
        placeholderRef.current.style.display = "none";
      }
    }
  }, []);

  const visuallyHidden: React.CSSProperties = {
    visibility: "hidden",
    position: "absolute",
    top: "0px",
  };

  return (
    <>
      <Skeleton
        style={{
          height: "100%",
          width: "100%",
          transform: "none",
          transformOrigin: "none",
          ...(imgProps.style ?? {}),
          ...(loadingStyles ?? {}),
        }}
        ref={placeholderRef}
        className={imgProps.className}
      />
      <img
        ref={imageRef}
        {...imgProps}
        style={{
          ...(imgProps.style ?? {}),
          ...visuallyHidden,
        }}
        onLoad={(...e) => {
          const image = e[0].target as HTMLImageElement;
          if (placeholderRef.current) {
            placeholderRef.current.style.display = "none";
          }
          image.style.position = "inherit";
          image.style.top = "inherit";
          image.style.visibility = "visible";
        }}
        onError={(...e) => {
          if (removeOnError && placeholderRef.current) {
            placeholderRef.current.style.display = "none";
          }
        }}
        src={proxyImageUrl(imgProps.src ?? "")}
      />
    </>
  );
});

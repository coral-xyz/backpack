import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { proxyImageUrl } from "@coral-xyz/common";
import { Skeleton } from "@mui/material";

type ImgProps = React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>;
export const ProxyImage = React.memo(function ProxyImage({
  removeOnError,
  loadingStyles,
  size,
  ...imgProps
}: {
  removeOnError?: boolean;
  loadingStyles?: React.CSSProperties;
  size?: number;
} & ImgProps) {
  const placeholderRef = useRef<HTMLSpanElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [errCount, setErrCount] = useState(0);

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

  useEffect(() => {
    // This is a hack since `onLoad` does not fire sometimes.
    // This timeout makes the skeleton goes away.
    setTimeout(() => {
      if (placeholderRef.current) {
        placeholderRef.current.style.display = "none";
        if (imageRef.current) {
          imageRef.current.style.position =
            imgProps?.style?.position ?? "inherit";
          /// @ts-ignore
          imageRef.current.style.top = imgProps?.style?.top ?? "inherit";
          imageRef.current.style.visibility = "visible";
        }
      }
    }, 1500);
  }, []);

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
        loading="lazy"
        ref={imageRef}
        {...imgProps}
        style={{
          ...(imgProps.style ?? {}),
          ...visuallyHidden,
        }}
        alt=""
        onLoad={(...e) => {
          const image = e[0].target as HTMLImageElement;
          if (placeholderRef.current) {
            placeholderRef.current.style.display = "none";
          }
          image.style.position = imgProps?.style?.position ?? "inherit";
          /// @ts-ignore
          image.style.top = imgProps?.style?.top ?? "inherit";
          image.style.visibility = "visible";
        }}
        onError={(...e) => {
          setErrCount((count) => {
            if (count >= 1) {
              if (removeOnError && placeholderRef.current) {
                placeholderRef.current.style.display = "none";
              }
            } else {
              if (imageRef.current) imageRef.current.src = imgProps.src ?? "";
            }
            return count + 1;
          });
        }}
        src={proxyImageUrl(imgProps.src ?? "", size)}
      />
    </>
  );
});

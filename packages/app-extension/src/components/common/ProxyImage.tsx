import React, { useRef } from "react";
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
  const ref = useRef(null);

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
        ref={ref}
        className={imgProps.className}
      />
      <img
        {...imgProps}
        style={{
          ...(imgProps.style ?? {}),
          ...visuallyHidden,
        }}
        onLoad={(...e) => {
          // setLoading(false);
          const image = e[0].target as HTMLImageElement;
          if (ref.current) {
            console.log(ref.current);
            // @ts-ignore
            ref.current.style.display = "none";
          }
          image.parentElement;
          image.style.position = "inherit";
          image.style.top = "inherit";
          image.style.visibility = "visible";
        }}
        onError={(...e) => {
          if (removeOnError) {
            if (ref.current) {
              console.log(ref.current);
              // @ts-ignore
              ref.current.style.display = "none";
            }
          }
        }}
        src={proxyImageUrl(imgProps.src ?? "")}
      />
    </>
  );
});

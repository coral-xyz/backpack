import React, { useEffect, useState } from "react";
import { proxyImageUrl } from "@coral-xyz/common";
import { Skeleton } from "@mui/material";

type ImgProps = React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>;
export function ProxyImage({
  removeOnError,
  loadingStyles,
  ...imgProps
}: {
  removeOnError?: boolean;
  loadingStyles?: React.CSSProperties;
} & ImgProps) {
  const [loading, setLoading] = useState(true);
  const [hasError, setError] = useState(false);

  if (hasError && removeOnError) {
    return null;
  }

  const visuallyHidden: React.CSSProperties = {
    visibility: "hidden",
    position: "absolute",
    top: "0px",
  };

  return (
    <>
      {loading && (
        <Skeleton
          style={{
            height: "100%",
            width: "100%",
            transform: "none",
            transformOrigin: "none",
            ...(imgProps.style ?? {}),
            ...(loadingStyles ?? {}),
          }}
          className={imgProps.className}
        />
      )}
      <img
        {...imgProps}
        style={{
          ...(imgProps.style ?? {}),
          ...(loading ? visuallyHidden : {}),
        }}
        onLoad={(...e) => {
          setLoading(false);
          imgProps.onLoad && imgProps.onLoad(...e);
        }}
        onError={(...e) => {
          setError(true);
          imgProps.onError && imgProps.onError(...e);
        }}
        src={proxyImageUrl(imgProps.src ?? "")}
      />
    </>
  );
}

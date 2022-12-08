import React, { useEffect, useState } from "react";
import { proxyImageUrl } from "@coral-xyz/common";
import { Skeleton } from "@mui/material";

const imageCache: string[] = [];

export function ProxyImage(
  props: React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >
) {
  const [loading, setLoading] = useState(true);
  const [hasError, setError] = useState(false);

  useEffect(() => {
    if (props.src && !imageCache.includes(props.src)) {
      const img = new Image();
      img.onload = () => setLoading(false);
      img.onerror = () => setError(true);
      img.src = props.src;
      imageCache.push(props.src);
    }
  }, [props.src]);

  if (!props.src || hasError) {
    return null;
  }
  const visuallyHidden: React.CSSProperties = {
    visibility: "hidden",
    position: "absolute",
    top: "0px",
  };

  return (
    <div
      style={{
        position: "relative",
      }}
    >
      {loading && (
        <Skeleton
          height={props.height}
          width={props.width}
          style={{ transform: "none", ...(props.style ?? {}) }}
        />
      )}
      <img
        {...props}
        style={{ ...(props.style ?? {}), ...(loading ? visuallyHidden : {}) }}
        onLoad={() => setLoading(false)}
        onError={() => setError(true)}
        src={proxyImageUrl(props.src)}
      />
    </div>
  );
}

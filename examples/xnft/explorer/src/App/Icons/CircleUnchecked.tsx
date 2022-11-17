import React from "react";
import { Path, Svg } from "react-xnft";
import IconBase from "./IconBase";

function CircleUnchecked({
  size,
  ...props
}: {
  size: number;
  color: string;
  strokeWidth?: number;
  isFilled?: boolean;
  style?: any;
  tw?: string;
}) {
  return (
    <IconBase
      path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"
      pathHeight={24}
      pathWidth={24}
      width={size}
      height={size}
      {...props}
    />
  );
}

export default CircleUnchecked;

import React from "react";
import { Path, Svg } from "react-xnft";

function IconBase({
  path,
  pathHeight,
  pathWidth,
  height,
  width,
  color,
  isFilled = true,
  strokeWidth = 0,
  style = {},
  tw = "",
}: {
  path: string;
  pathHeight: number;
  pathWidth: number;
  height: number;
  width: number;
  color: string;
  style?: any;
  strokeWidth?: number;
  isFilled?: boolean;
  tw?: string;
}) {
  return (
    <Svg
      key={path}
      width={width}
      height={height}
      viewBox={`-${strokeWidth} -${strokeWidth} ${
        pathHeight + strokeWidth * 2
      } ${pathWidth + strokeWidth * 2}`}
      fill="none"
      tw={tw}
    >
      <Path d={`M0 0h${pathHeight}v${pathWidth}H0V0z`} fill="none" />
      <Path
        d={path}
        fill={isFilled ? color : "none"}
        stroke={color}
        style={{
          strokeWidth: strokeWidth,
          ...style,
        }}
      />
    </Svg>
  );
}

export default IconBase;

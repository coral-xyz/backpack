import React from "react";
import { Path, Svg } from "react-xnft";
import IconBase from "./IconBase";

function FilterIcon({
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
      path="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"
      pathHeight={24}
      pathWidth={24}
      width={size}
      height={size}
      {...props}
    />
  );
}

export default FilterIcon;

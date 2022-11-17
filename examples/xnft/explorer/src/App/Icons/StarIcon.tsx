import React from "react";
import Icon from "./IconBase";

export function StarIcon({
  size,
  ...props
}: {
  size: number;
  color: string;
  strokeWidth?: number;
  isFilled?: boolean;
  style?: any;
}) {
  return (
    <Icon
      path="M9.00001 14.5196L13.15 17.0296C13.91 17.4896 14.84 16.8096 14.64 15.9496L13.54 11.2296L17.21 8.04958C17.88 7.46958 17.52 6.36958 16.64 6.29958L11.81 5.88958L9.92001 1.42958C9.58001 0.619583 8.42001 0.619583 8.08001 1.42958L6.19001 5.87958L1.36001 6.28958C0.480012 6.35958 0.120012 7.45958 0.790012 8.03958L4.46001 11.2196L3.36001 15.9396C3.16001 16.7996 4.09001 17.4796 4.85001 17.0196L9.00001 14.5196Z"
      pathWidth={18}
      pathHeight={18}
      height={size}
      width={size}
      {...props}
    />
  );
}

export default StarIcon;

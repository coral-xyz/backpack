import { useCallback, useState } from "react";
import type { TypographyProps } from "@mui/material";
import { Typography } from "@mui/material";

export function CopyableTypography({
  style,
  children,
  onCopy,
  ...props
}: { onCopy: () => void } & TypographyProps) {
  const [isCopying, setIsCopying] = useState(false);
  const onClick = useCallback(async () => {
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 1000);
    onCopy();
  }, [onCopy]);

  return (
    <Typography
      onClick={onClick}
      style={{
        cursor: "pointer",
        ...style,
      }}
      {...props}
    >
      {isCopying ? "Copied!" : children}
    </Typography>
  );
}

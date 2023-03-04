import type { CSSProperties, MouseEvent } from "react";
import { useStyles } from "@coral-xyz/message-sdk/dist/esm/components/styles";

export function UserAction({
  text,
  onClick,
  style,
}: {
  text: string;
  onClick: (ev: MouseEvent) => void;
  style?: CSSProperties;
}) {
  const classes = useStyles();
  return (
    <div
      className={classes.userRequestText}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        fontSize: "14px",
        ...style,
      }}
      onClick={onClick}
    >
      {text}
    </div>
  );
}

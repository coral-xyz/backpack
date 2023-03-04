import type { CSSProperties, MouseEvent } from "react";
import { styles } from "@coral-xyz/themes";

const useStyles = styles((theme) => ({
    userRequestText: {
        color: theme.custom.colors.textPlaceholder,
    },
}));


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

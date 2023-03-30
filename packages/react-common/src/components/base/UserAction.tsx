import type { CSSProperties, MouseEvent } from "react";
import { styles } from "@coral-xyz/themes";

import { Loading } from "./Loading";
const useStyles = styles((theme) => ({
  userRequestText: {
    color: theme.custom.colors.textPlaceholder,
  },
}));

export function UserAction({
  text,
  onClick,
  style,
  isLoading,
}: {
  text: string;
  onClick: (ev: MouseEvent) => void;
  style?: CSSProperties;
  isLoading?: boolean;
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
      {!isLoading ? (
        <>{text}</>
      ) : (
        <Loading iconStyle={{ width: "20px", height: "20px" }} />
      )}
    </div>
  );
}

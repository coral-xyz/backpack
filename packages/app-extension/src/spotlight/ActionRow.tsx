import { PushDetail } from "@coral-xyz/react-common";
import { useTheme } from "@coral-xyz/tamagui";

import { SELECTED_BLUE } from "./colors";
import { Line } from "./Line";

export const ActionRow = ({
  title,
  onClick,
  selected = false,
}: {
  title: string;
  onClick: any;
  selected?: boolean;
}) => {
  const theme = useTheme();

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "20px 10px",
          background: selected ? SELECTED_BLUE : "",
          cursor: "pointer",
        }}
        onClick={onClick}
      >
        <div style={{ color: theme.baseTextHighEmphasis.val }}>{title}</div>
        <div>
          <PushDetail />
        </div>
      </div>
      <Line />
    </div>
  );
};

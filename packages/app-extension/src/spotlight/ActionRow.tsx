import { PushDetail } from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";

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
  const theme = useCustomTheme();

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
        <div style={{ color: theme.custom.colors.fontColor }}>{title}</div>
        <div>
          <PushDetail />
        </div>
      </div>
      <Line />
    </div>
  );
};

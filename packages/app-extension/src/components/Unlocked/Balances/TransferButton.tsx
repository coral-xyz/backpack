import { useTheme } from "@coral-xyz/tamagui";
import { Typography } from "@mui/material";

import { WithHeaderButton } from "./TokensWidget/Token";

export function TransferButton({
  label,
  labelComponent,
  routes,
  disabled = false,
}: {
  label: string;
  labelComponent: any;
  routes?: Array<{ props?: any; component: any; title: string; name: string }>;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <div
      style={{
        width: "52px",
        height: "70px",
        // semi-transparent and unclickable when disabled=true
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      <WithHeaderButton
        style={{
          padding: 0,
          width: "42px",
          height: "42px",
          minWidth: "42px",
          borderRadius: "21px",
          boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.15)",
          marginLeft: "auto",
          marginRight: "auto",
          display: "block",
          marginBottom: "8px",
        }}
        label=""
        labelComponent={labelComponent}
        routes={routes}
      />
      <Typography
        style={{
          color: theme.baseTextMedEmphasis.val,
          fontSize: "14px",
          fontWeight: 500,
          lineHeight: "20px",
          textAlign: "center",
        }}
      >
        {label}
      </Typography>
    </div>
  );
}

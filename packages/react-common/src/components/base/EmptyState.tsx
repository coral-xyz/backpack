import { useCustomTheme } from "@coral-xyz/themes";
import { Typography } from "@mui/material";

import { PrimaryButton } from "./PrimaryButton";

export const EmptyState: React.FC<{
  icon: (props: any) => React.ReactNode;
  title: string;
  subtitle: string;
  buttonText?: string;
  onClick?: () => void;
  minimize?: boolean;
  verticallyCentered?: boolean;
  contentStyle?: React.CSSProperties;
  style?: React.CSSProperties;
}> = ({
  icon,
  title,
  subtitle,
  buttonText,
  onClick,
  contentStyle,
  style,
  minimize,
  verticallyCentered = true,
}) => {
  const theme = useCustomTheme();

  return (
    <div
      style={{
        borderRadius: "12px",
        paddingLeft: "12px",
        paddingRight: "12px",
        height: verticallyCentered ? "100%" : "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        ...style,
      }}
    >
      <div
        style={{
          borderRadius: "12px",
          background: theme.custom.colors.nav,
          padding: "16px",
          border: `${theme.custom.colors.borderFull}`,
          ...contentStyle,
        }}
      >
        {icon({
          style: {
            color: theme.custom.colors.icon,
            width: "56px",
            height: "56px",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
            marginBottom: "16px",
          },
        })}
        <Typography
          style={{
            fontSize: "24px",
            lineHeight: "32px",
            textAlign: "center",
            fontWeight: 500,
            color: theme.custom.colors.fontColor,
          }}
        >
          {title}
        </Typography>
        {minimize !== true && (
          <Typography
            style={{
              marginTop: "8px",
              color: theme.custom.colors.secondary,
              textAlign: "center",
              fontSize: "16px",
              lineHeight: "24px",
              fontWeight: 500,
            }}
          >
            {subtitle}
          </Typography>
        )}
        {minimize !== true && buttonText && (
          <PrimaryButton
            onClick={onClick}
            label={buttonText}
            style={{
              marginTop: "40px",
            }}
          />
        )}
      </div>
    </div>
  );
};

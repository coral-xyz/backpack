import { Typography } from "@mui/material";
import { useCustomTheme } from "@coral-xyz/themes";
import { SecondaryButton } from ".";

export const EmptyState: React.FC<{
  icon: (props: any) => React.ReactNode;
  title: string;
  subtitle: string;
  buttonText?: string;
  onClick?: () => void;
  contentStyle?: React.CSSProperties;
}> = ({ icon, title, subtitle, buttonText, onClick, contentStyle }) => {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        borderRadius: "12px",
        paddingLeft: "16px",
        paddingRight: "16px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          ...contentStyle,
        }}
      >
        {icon({
          style: {
            color: theme.custom.colors.secondary,
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
            marginBottom: "8px",
          }}
        >
          {title}
        </Typography>
        <Typography
          style={{
            color: theme.custom.colors.secondary,
            textAlign: "center",
            fontSize: "16px",
            lineHeight: "24px",
            fontWeight: 500,
          }}
        >
          {subtitle}
        </Typography>
        {buttonText && (
          <SecondaryButton
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

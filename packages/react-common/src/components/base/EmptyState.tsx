import { useCustomTheme } from "@coral-xyz/themes";
import { Box, Typography } from "@mui/material";

import { PrimaryButton } from "./PrimaryButton";

export const EmptyState: React.FC<{
  icon: (props: any) => React.ReactNode;
  header?: React.ReactNode;
  title: string;
  subtitle: string;
  buttonText?: string;
  marketplaces?: { Icon: any; label: string; link: string }[];
  onClick?: () => void;
  minimize?: boolean;
  verticallyCentered?: boolean;
  contentStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  innerStyle?: React.CSSProperties;
}> = ({
  icon,
  header,
  title,
  subtitle,
  buttonText,
  marketplaces,
  onClick,
  contentStyle,
  style,
  innerStyle,
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
          border: `${theme.custom.colors.borderFull}`,
          overflow: "hidden",
          ...innerStyle,
        }}
      >
        {header}
        <div
          style={{
            padding: "16px",
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
          {minimize !== true ? (
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
          ) : null}

          {minimize !== true && marketplaces ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                marginTop: "25px",
              }}
            >
              {marketplaces.map(({ Icon, label, link }, index) => (
                <Box key={index} onClick={() => window.open(link)}>
                  <Icon
                    style={{
                      height: 60,
                      width: 60,
                      borderRadius: 10,
                      marginLeft: "15px",
                      marginRight: "15px",
                    }}
                  />
                  <Typography
                    style={{
                      marginTop: "1px",
                      color: theme.custom.colors.secondary,
                      textAlign: "center",
                      fontSize: "12px",
                      lineHeight: "24px",
                      fontWeight: 600,
                    }}
                  >
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : null}

          {minimize !== true && buttonText ? (
            <PrimaryButton
              onClick={onClick}
              label={buttonText}
              style={{
                marginTop: "40px",
                ...(window.matchMedia("(max-width: 650px)").matches
                  ? {}
                  : {
                      display: "block",
                      marginLeft: "auto",
                      marginRight: "auto",
                      width: "max-content",
                      padding: "0 24px",
                    }),
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

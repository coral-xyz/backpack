import React from "react";
import { YStack, useTheme } from "@coral-xyz/tamagui";
import { Typography } from "@mui/material";

import { PrimaryButton } from "./PrimaryButton";

export const EmptyState: React.FC<{
  icon: (props: any) => React.ReactNode;
  header?: React.ReactNode;
  title: string | React.ReactNode;
  subtitle: string;
  buttonText?: string;
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
  onClick,
  contentStyle,
  style,
  innerStyle,
  minimize,
  verticallyCentered = true,
}) => {
  const theme = useTheme();

  return (
    <div
      style={{
        borderRadius: "12px",
        background: theme.baseBackgroundL1.val,
        border: `${theme.baseBorderLight.val}`,
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
            color: theme.baseIcon.val,
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
            color: theme.baseTextHighEmphasis.val,
          }}
        >
          {title}
        </Typography>
        {!minimize ? (
          <Typography
            style={{
              marginTop: "8px",
              color: theme.baseTextMedEmphasis.val,
              textAlign: "center",
              fontSize: "16px",
              lineHeight: "24px",
              fontWeight: 500,
            }}
          >
            {subtitle}
          </Typography>
        ) : null}
        {!minimize && buttonText ? (
          <YStack marginTop={"40px"}>
            <PrimaryButton
              onClick={onClick}
              label={buttonText}
              // // @ts-ignore
              // style={{
              //   marginTop: "40px",
              //   ...(window.matchMedia("(max-width: 650px)").matches
              //     ? {}
              //     : {
              //         display: "block",
              //         marginLeft: "auto",
              //         marginRight: "auto",
              //         width: "max-content",
              //         padding: "0 24px",
              //       }),
              // }}
            />
          </YStack>
        ) : null}
      </div>
    </div>
  );
};

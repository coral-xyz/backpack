import type { FunctionComponent } from "react";
import { useCustomTheme } from "@coral-xyz/themes";
import Button, { type ButtonProps } from "@mui/material/Button";
import Popover, { type PopoverProps } from "@mui/material/Popover";

export const PopoverMenu: FunctionComponent<PopoverProps> = ({
  children,
  ...rest
}) => {
  const theme = useCustomTheme();
  return (
    <Popover {...rest}>
      <div
        style={{
          width: "100%",
          background: theme.custom.colors.background,
          padding: 1,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {children}
      </div>
    </Popover>
  );
};

type GroupProps = {
  children?: React.ReactNode;
};

export const PopoverMenuItemGroup: FunctionComponent<GroupProps> = ({
  children,
}) => {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        background: theme.custom.colors.nav,
        borderRadius: 2,
        padding: "2px 0",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </div>
  );
};

export const PopoverMenuItem: FunctionComponent<ButtonProps> = ({
  children,
  style,
  ...rest
}) => {
  const theme = useCustomTheme();
  return (
    <Button
      disableRipple
      style={{
        textTransform: "none",
        color: theme.custom.colors.fontColor,
        fontSize: "14px",
        padding: "8px 16px",
        display: "inline",
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: "flex", alignItems: "center" }}>{children}</div>
    </Button>
  );
};

export default {
  Group: PopoverMenuItemGroup,
  Item: PopoverMenuItem,
  Root: PopoverMenu,
};

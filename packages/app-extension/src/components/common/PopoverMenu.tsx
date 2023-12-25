import type { FunctionComponent } from "react";
import {
  temporarilyMakeStylesForBrowserExtension,
  useTheme,
} from "@coral-xyz/tamagui";
import Button, { type ButtonProps } from "@mui/material/Button";
import Popover, { type PopoverProps } from "@mui/material/Popover";

const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
  popOverRoot: {
    // FIXME: the name of the selector below could change at any time
    "& .css-1y04bq4": {
      backgroundColor: theme.custom.colors.backgroundBackdrop,
    },
  },
}));

const PopoverMenu: FunctionComponent<PopoverProps> = ({
  children,
  ...rest
}) => {
  const theme = useTheme();
  const classes = useStyles();

  return (
    <Popover className={classes.popOverRoot} {...rest}>
      <div
        style={{
          width: "100%",
          background: theme.baseBackgroundL1.val,
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

const PopoverMenuItemGroup: FunctionComponent<GroupProps> = ({ children }) => {
  const theme = useTheme();
  return (
    <div
      style={{
        background: theme.baseBackgroundL1.val,
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

const PopoverMenuItem: FunctionComponent<ButtonProps> = ({
  children,
  style,
  ...rest
}) => {
  const theme = useTheme();
  return (
    <Button
      disableRipple
      style={{
        textTransform: "none",
        color: theme.baseTextHighEmphasis.val,
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

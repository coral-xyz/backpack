import { type MouseEvent, useCallback } from "react";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { CallMade, ChevronRight } from "@mui/icons-material";
import {
  Divider,
  List as MuiList,
  ListItem as MuiListItem,
} from "@mui/material";

const useStyles = styles((theme) => ({
  settingsContentListItem: {
    padding: "8px",
    height: "56px",
    display: "flex",
    backgroundColor: `${theme.custom.colors.nav} !important`,
  },
  settingsContentListItemInverted: {
    padding: "8px",
    height: "56px",
    display: "flex",
    backgroundColor: `${theme.custom.colorsInverted.nav} !important`,
    "&:hover": {
      backgroundColor: `${theme.custom.colorsInverted.listItemHover} !important`,
    },
  },
  dividerRoot: {
    borderColor: "transparent !important",
  },
}));

export function List({ className, style, inverted, children }: any) {
  const theme = useCustomTheme();
  return (
    <MuiList
      className={className}
      style={{
        color: inverted
          ? theme.custom.colorsInverted.fontColor
          : theme.custom.colors.fontColor,
        padding: 0,
        marginLeft: "16px",
        marginRight: "16px",
        borderRadius: "8px",
        ...style,
      }}
    >
      {children}
    </MuiList>
  );
}

export function ListItem({
  style,
  children,
  isFirst,
  isLast,
  id,
  disableBottomBorder = undefined,
  onClick = undefined,
  button = true,
  borderColor,
  detail,
  inverted,
  classes,
  allowOnclickPropagation,
}: any) {
  const _classes = useStyles();
  const theme = useCustomTheme();
  const buttonProps = button ? { disableRipple: true } : {};
  const handleClick = useCallback(
    (ev: MouseEvent<HTMLDivElement>) => {
      if (!allowOnclickPropagation) {
        ev.preventDefault();
      }
      onClick?.(ev);
    },
    [onClick]
  );

  return (
    <>
      <MuiListItem
        {...buttonProps}
        data-testid={id}
        button={button}
        className={
          inverted
            ? _classes.settingsContentListItemInverted
            : _classes.settingsContentListItem
        }
        onClick={handleClick}
        style={{
          ...isFirstLastListItemStyle(isFirst, isLast),
          ...style,
        }}
        classes={classes}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
          }}
        >
          {children}
        </div>
        {detail}
      </MuiListItem>
      {!isLast && !disableBottomBorder ? <Divider
        style={{
            backgroundColor: borderColor
              ? borderColor
              : theme.custom.colors.border,
            height: "1px",
          }}
        classes={{ root: _classes.dividerRoot }}
        /> : null}
    </>
  );
}

export function PushDetail({ style }: { style?: React.CSSProperties }) {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <ChevronRight
        style={{
          color: theme.custom.colors.icon,
          ...style,
        }}
      />
    </div>
  );
}

export function LaunchDetail({ style }: { style?: React.CSSProperties }) {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        ...style,
      }}
    >
      <CallMade
        style={{
          color: theme.custom.colors.icon,
        }}
      />
    </div>
  );
}

// Styles to properly highlight list item cells with rounded corners.
// This is a total hack and presumably there's a better way to do this
// with MUI.
export function isFirstLastListItemStyle(
  isFirst: boolean,
  isLast: boolean,
  borderRadius?: number
) {
  const radius = `${borderRadius ?? 8}px`;
  return {
    borderTopLeftRadius: isFirst ? radius : 0,
    borderTopRightRadius: isFirst ? radius : 0,
    borderBottomLeftRadius: isLast ? radius : 0,
    borderBottomRightRadius: isLast ? radius : 0,
  };
}

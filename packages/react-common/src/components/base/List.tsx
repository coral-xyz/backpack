import { type MouseEvent, useCallback } from "react";
import {
  temporarilyMakeStylesForBrowserExtension,
  useTheme,
} from "@coral-xyz/tamagui";
import { CallMade, ChevronRight } from "@mui/icons-material";
import {
  Divider,
  List as MuiList,
  ListItem as MuiListItem,
} from "@mui/material";

const useStyles = temporarilyMakeStylesForBrowserExtension(() => ({
  dividerRoot: {
    borderColor: "transparent !important",
  },
}));

export function List({ className, style, inverted, children }: any) {
  const theme = useTheme();
  return (
    <MuiList
      className={className}
      style={{
        backgroundColor: theme.baseBackgroundL1.val,
        color: inverted
          ? theme.invertedBaseTextHighEmphasis
          : theme.baseTextHighEmphasis.val,
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
  classes,
  allowOnclickPropagation,
}: any) {
  const _classes = useStyles();
  const theme = useTheme();
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
        // className={
        //   inverted
        //     ? _classes.settingsContentListItemInverted
        //     : _classes.settingsContentListItem
        // }
        onClick={handleClick}
        style={{
          ...isFirstLastListItemStyle(isFirst, isLast),
          ...style,
        }}
        sx={() => ({
          padding: "8px",
          height: "56px",
          display: "flex",
          backgroundColor: `${theme.baseBackgroundL1.val} !important`,
          "&:hover": {
            backgroundColor: `${theme.baseBackgroundL2.val} !important`,
          },
        })}
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
      {!isLast && !disableBottomBorder ? (
        <Divider
          style={{
            backgroundColor: borderColor ? borderColor : theme.baseBorderLight,
            height: "1px",
          }}
          classes={{ root: _classes.dividerRoot }}
        />
      ) : null}
    </>
  );
}

export function PushDetail({ style }: { style?: React.CSSProperties }) {
  const theme = useTheme();
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
          color: theme.baseIcon.val,
          ...style,
        }}
      />
    </div>
  );
}

export function LaunchDetail({ style }: { style?: React.CSSProperties }) {
  const theme = useTheme();
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
          color: theme.baseIcon.val,
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

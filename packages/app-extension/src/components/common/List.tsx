import {
  Divider,
  List as MuiList,
  ListItem as MuiListItem,
} from "@mui/material";
import { ChevronRight, CallMade } from "@mui/icons-material";
import { styles, useCustomTheme } from "@coral-xyz/themes";

const useStyles = styles((theme) => ({
  settingsContentListItem: {
    padding: "8px",
    height: "56px",
    display: "flex",
    backgroundColor: `${theme.custom.colors.nav} !important`,
    "&:hover": {
      backgroundColor: "red",
    },
  },
  dividerRoot: {
    borderColor: "transparent !important",
  },
}));

export function List({ className, style, children }: any) {
  const theme = useCustomTheme();
  return (
    <MuiList
      className={className}
      style={{
        color: theme.custom.colors.fontColor,
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
  onClick = undefined,
  button = true,
  borderColor,
  detail,
  classes,
}: any) {
  const _classes = useStyles();
  const theme = useCustomTheme();
  const buttonProps = button ? { disableRipple: true } : {};
  return (
    <>
      <MuiListItem
        {...buttonProps}
        data-testid={id}
        button={button}
        className={_classes.settingsContentListItem}
        onClick={onClick}
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
      {!isLast && (
        <Divider
          style={{
            backgroundColor: borderColor
              ? borderColor
              : theme.custom.colors.border,
            height: "1px",
          }}
          classes={{ root: _classes.dividerRoot }}
        />
      )}
    </>
  );
}

export function PushDetail() {
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

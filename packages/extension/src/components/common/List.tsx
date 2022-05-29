import {
  useTheme,
  List as MuiList,
  ListItem as MuiListItem,
} from "@mui/material";

import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme: any) => ({
  settingsContentListItem: {
    padding: "8px",
    height: "56px",
    display: "flex",
  },
}));

export function List({ style, children }: any) {
  const theme = useTheme() as any;
  return (
    <MuiList
      style={{
        color: theme.custom.colors.fontColor,
        background: theme.custom.colors.nav,
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

export function ListItem({ key, style, children, onClick, isLast }: any) {
  const classes = useStyles();
  const theme = useTheme() as any;
  return (
    <MuiListItem
      key={key}
      button
      className={classes.settingsContentListItem}
      onClick={() => onClick()}
      style={{
        borderBottom: isLast
          ? undefined
          : `solid 1pt ${theme.custom.colors.border}`,
        ...style,
      }}
    >
      {children}
    </MuiListItem>
  );
}

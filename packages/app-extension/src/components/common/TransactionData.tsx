import { List, ListItem, Typography } from "@mui/material";
import { styles } from "@coral-xyz/themes";

const useStyles = styles((theme) => ({
  listDescription: {
    color: theme.custom.colors.secondary,
    fontSize: "14px",
    marginBottom: "8px",
  },
  listRoot: {
    color: theme.custom.colors.fontColor,
    padding: "0",
    borderRadius: "4px",
    fontSize: "14px",
  },
  listItemRoot: {
    alignItems: "start",
    borderBottom: `1px solid #000`,
    borderRadius: "4px",
    background: theme.custom.colors.nav,
    padding: "8px",
  },
  listItemIconRoot: {
    minWidth: "inherit",
    height: "20px",
    width: "20px",
    marginRight: "8px",
  },
  warning: {
    color: theme.custom.colors.negative,
    fontSize: "14px",
    textAlign: "center",
    marginTop: "8px",
  },
}));

export function TransactionData({
  menuItems,
  simulationError = false,
}: {
  menuItems: (string | JSX.Element)[][];
  simulationError: boolean;
}) {
  const classes = useStyles();

  return (
    <>
      <Typography className={classes.listDescription}>
        Transaction details
      </Typography>
      <List className={classes.listRoot}>
        {menuItems.map((row, index: number) => {
          return (
            <ListItem
              key={index}
              className={classes.listItemRoot}
              secondaryAction={row[1]}
            >
              {row[0]}
            </ListItem>
          );
        })}
      </List>
      {simulationError && (
        <div className={classes.warning}>
          This transaction is unlikely to succeed.
        </div>
      )}
    </>
  );
}

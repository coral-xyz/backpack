import {
  makeStyles,
  Button,
  Typography,
  List,
  ListItem,
  ListItemIcon,
} from "@material-ui/core";
import { useBlockchainTokenAccount } from "../../../hooks/useBlockchainBalances";

const useStyles = makeStyles((theme: any) => ({
  tokenHeaderContainer: {
    width: "208px",
    display: "flex",
    justifyContent: "space-between",
    marginLeft: "auto",
    marginRight: "auto",
  },
  headerButton: {
    width: "100px",
    height: "40px",
    backgroundColor: theme.custom.colors.nav,
    color: theme.custom.colors.fontColor,
    "&:hover": {
      backgroundColor: theme.custom.colors.nav,
    },
  },
}));

export function Token({ blockchain, address }: any) {
  return (
    <div>
      <TokenHeader blockchain={blockchain} address={address} />
      <TokenRecentActivity />
    </div>
  );
}

function TokenHeader({ blockchain, address }: any) {
  const classes = useStyles();
  const token = useBlockchainTokenAccount(blockchain, address);
  return (
    <div className={classes.tokenHeaderContainer}>
      <Button
        disableElevation
        variant="contained"
        className={classes.headerButton}
        disableRipple
      >
        Deposit
      </Button>
      <Button
        disableElevation
        variant="contained"
        className={classes.headerButton}
        disableRipple
      >
        Send
      </Button>
    </div>
  );
}

function TokenRecentActivity() {
  const actions: any = [];
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <Typography>Recent Actvitiy</Typography>
        </div>
        <div>
          <Typography>All Wallets</Typography>
        </div>
      </div>
      <List>
        {actions.map((action: any) => (
          <ListItem>
            <ListItemIcon></ListItemIcon>
            <div></div>
          </ListItem>
        ))}
      </List>
    </div>
  );
}

import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme: any) => ({
  container: {
    flex: 1,
  },
}));

export function Unlocked() {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <div>Unlocked 200ms wallet yay</div>
    </div>
  );
}

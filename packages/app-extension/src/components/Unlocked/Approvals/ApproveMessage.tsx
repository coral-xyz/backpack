import { Link, List, ListItem, ListItemIcon, Typography } from "@mui/material";
import _CheckIcon from "@mui/icons-material/Check";
import { styles } from "@coral-xyz/themes";
import { WithApproval } from ".";

const useStyles = styles((theme) => ({
  title: {
    fontWeight: 500,
    fontSize: "18px",
    lineHeight: "24px",
    color: theme.custom.colors.fontColor,
    marginBottom: "48px",
    marginTop: "16px",
    textAlign: "center",
  },
  listDescription: {
    color: theme.custom.colors.secondary,
    fontSize: "14px",
    marginBottom: "8px",
  },
}));

export function ApproveMessage({ origin, title, message, onCompletion }: any) {
  const classes = useStyles();

  const onConfirm = async () => {
    await onCompletion(true);
  };

  const onDeny = async () => {
    await onCompletion(false);
  };

  return (
    <WithApproval
      origin={origin}
      originTitle={title}
      title={<div className={classes.title}>Approve Message</div>}
      onConfirm={onConfirm}
      onConfirmLabel="Approve"
      onDeny={onDeny}
    >
      <>
        <Typography className={classes.listDescription}>Message</Typography>
        {message}
      </>
    </WithApproval>
  );
}

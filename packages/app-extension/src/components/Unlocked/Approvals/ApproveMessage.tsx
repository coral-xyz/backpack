import { Typography } from "@mui/material";
import _CheckIcon from "@mui/icons-material/Check";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { WithApproval } from ".";
import { TextField } from "@coral-xyz/react-xnft-renderer";

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
  textFieldInput: {
    marginTop: 0,
    "& .MuiOutlinedInput-root": {
      padding: 0,
      fontSize: "12px",
    },
  },
}));

export function ApproveMessage({
  origin,
  title,
  message,
  onCompletion,
  wallet,
}: any) {
  const classes = useStyles();
  const theme = useCustomTheme();

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
      wallet={wallet}
      title={<div className={classes.title}>Approve Message</div>}
      onConfirm={onConfirm}
      onConfirmLabel="Approve"
      onDeny={onDeny}
    >
      <>
        <Typography className={classes.listDescription}>Message</Typography>
        <TextField
          rootClass={classes.textFieldInput}
          value={message}
          rows={8}
          disabled={true}
          inputProps={{
            style: {
              background: theme.custom.colors.nav,
              padding: "8px",
            },
          }}
        />
      </>
    </WithApproval>
  );
}

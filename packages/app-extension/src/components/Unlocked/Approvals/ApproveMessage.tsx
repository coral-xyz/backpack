import { isKeyCold } from "@coral-xyz/recoil";
import { styles as makeStyles, useCustomTheme } from "@coral-xyz/themes";
import { Typography } from "@mui/material";
import * as anchor from "@project-serum/anchor";
import { useRecoilValue } from "recoil";

import { TextField } from "../../../plugin/Component";

import { Cold } from "./ApproveTransaction";
import { WithApproval } from ".";

const useStyles = makeStyles((theme) => ({
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
      "& textarea": {
        WebkitTextFillColor: theme.custom.colors.fontColor,
      },
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
  const _isKeyCold = useRecoilValue(isKeyCold(wallet));

  let displayMessage;
  try {
    displayMessage = anchor.utils.bytes.utf8.decode(
      anchor.utils.bytes.bs58.decode(message)
    );
  } catch (err) {
    displayMessage = message;
  }

  const onConfirm = async () => {
    await onCompletion(true);
  };

  const onDeny = async () => {
    await onCompletion(false);
  };

  if (_isKeyCold) {
    return <Cold origin={origin!} />;
  }

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
          value={displayMessage}
          rows={8}
          disabled
          inputProps={{
            style: {
              background: theme.custom.colors.nav,
              padding: "8px",
              color: theme.custom.colors.fontColor,
            },
          }}
        />
      </>
    </WithApproval>
  );
}

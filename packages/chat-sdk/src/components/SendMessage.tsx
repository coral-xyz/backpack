import { Button, TextField } from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";
import { useChatContext } from "./ChatContext";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const useStyles = makeStyles((theme: any) =>
  createStyles({
    wrapForm: {
      display: "flex",
      justifyContent: "center",
      width: "95%",
      margin: `${theme.spacing(0)} auto`,
    },
    wrapText: {
      width: "100%",
    },
    button: {
      //margin: theme.spacing(1),
    },
  })
);
export const SendMessage = () => {
  const classes = useStyles();
  const [messageContent, setMessageContent] = useState("");
  const { chatManager, setChats, userId } = useChatContext();
  return (
    <>
      <TextField
        value={messageContent}
        id="standard-text"
        label="Message"
        className={classes.wrapText}
        onChange={(e) => setMessageContent(e.target.value)}
      />
      <Button
        onClick={() => {
          if (chatManager && messageContent) {
            const client_generated_uuid = uuidv4();
            chatManager?.send(messageContent, client_generated_uuid);
            setChats((x) => [
              ...x,
              {
                message: messageContent,
                client_generated_uuid,
                received: false,
                uuid: userId,
              },
            ]);
            setMessageContent("");
          }
        }}
      >
        Send
      </Button>
    </>
  );
};

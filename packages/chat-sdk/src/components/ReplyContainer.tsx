import Close from "@mui/icons-material/Close";
import { createStyles, makeStyles } from "@mui/styles";

import { useChatContext } from "./ChatContext";
import { ParsedMessage } from "./ParsedMessage";

const useStyles = makeStyles((theme: any) =>
  createStyles({
    text: {
      color: theme.custom.colors.fontColor2,
    },
    icon: {
      color: theme.custom.colors.icon,
      width: "0.8em",
    },
    replyTo: {
      color: theme.custom.colors.fontColor3,
      fontWeight: 500,
      fontSize: 14,
      marginBottom: 8,
    },
  })
);

export const ReplyContainer = ({
  replyMsgId,
  parent_username,
  text,
  showCloseBtn,
  marginBottom,
  padding,
  align = "left",
}) => {
  const { setActiveReply } = useChatContext();
  const classes = useStyles();

  const scrollIntoView = () => {
    const element = document.getElementById(replyMsgId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div
      style={{
        marginBottom: marginBottom || 6,
        display: "flex",
        justifyContent: "space-between",
        flexDirection: align === "left" ? "row" : "row-reverse",
        padding: padding,
        paddingBottom: 0,
      }}
    >
      <div>
        <div className={classes.replyTo}>
          Replying to{" "}
          <span className={classes.text}>{parent_username || ""}</span>
        </div>
        <div
          className={classes.text}
          style={{
            borderLeft: "2px solid #DFE0E6",
            fontWeight: 400,
            paddingLeft: 12,
            lineHeight: 1.4,
            fontSize: 14,
          }}
        >
          <div onClick={scrollIntoView} style={{ cursor: "pointer" }}>
            <ParsedMessage message={text} />
          </div>
        </div>
      </div>
      {showCloseBtn ? <div
        style={{ cursor: "pointer" }}
        onClick={() => setActiveReply({ parent_client_generated_uuid: null })}
        >
        <Close className={classes.icon} />
      </div> : null}
    </div>
  );
};

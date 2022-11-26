import React, { useCallback, useEffect, useState } from "react";
import { createStyles, makeStyles } from "@mui/styles";
import { Gif as GifComponent } from "@giphy/react-components";
import { GiphyFetch } from "@giphy/js-fetch-api";

// use @giphy/js-fetch-api to fetch gifs, instantiate with your api key
const gf = new GiphyFetch("SjZwwCn1e394TKKjrMJWb2qQRNcqW8ro");

const useStyles = makeStyles((theme: any) =>
  createStyles({
    messageRow: {
      display: "flex",
    },
    messageContainer: {
      position: "relative",
      marginLeft: "10px",
      marginBottom: "10px",
      width: "100%",
      textAlign: "left",
      fontSize: "14px",
      color: theme.custom.colors.fontColor2,
    },
    messageContent: {
      padding: 0,
      margin: 0,
    },
    messageTimeStampRight: {
      fontSize: ".85em",
      fontWeight: "300",
    },
    avatar: {
      width: theme.spacing(4),
      height: theme.spacing(4),
      borderRadius: "4px",
    },
    messageLine: {
      display: "flex",
      justifyContent: "space-between",
      width: "100%",
      color: theme.custom.colors.fontColor2,
    },
    avatarNothing: {
      color: "transparent",
      backgroundColor: "transparent",
      width: theme.spacing(4),
      height: theme.spacing(4),
    },
    displayName: {
      marginLeft: "10px",
      fontSize: "12px",
      fontColor: "#4E5768",
    },
  })
);

const GifDemo = ({
  id,
  width,
  height,
  noLink,
  borderRadius,
  overlay,
  ...other
}: any) => {
  const [gif, setGif] = useState<any>();

  const fetch = useCallback(async () => {
    const { data: gif } = await gf.gif(id);
    setGif(gif);
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch, id]);

  return gif ? (
    <GifComponent
      onGifClick={(_, e) => e.preventDefault()}
      key={`gif-${noLink}`}
      tabIndex={1}
      borderRadius={borderRadius}
      gif={gif}
      width={width}
      height={height}
      noLink={noLink}
      overlay={overlay}
      {...other}
    />
  ) : null;
};

export const MessageLeft = (props) => {
  const message = props.message ? props.message : "";
  const timestamp = props.timestamp ? new Date(props.timestamp) : new Date();
  const photoURL =
    props.image ||
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSYU3l2Xh_TvhuYraxr8HILzhActNrm6Ja63jjO5I&s";
  const displayName = props.username || "-";
  const classes = useStyles();

  function formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return hours + ":" + minutes + " " + ampm;
  }

  return (
    <>
      <div className={classes.messageRow}>
        <img alt={displayName} className={classes.avatar} src={photoURL}></img>
        <div className={classes.messageLine}>
          <div>
            <div className={classes.displayName}>@{displayName}</div>
            <div className={classes.messageContainer}>
              <div>
                <p className={classes.messageContent}>
                  {props.messageKind === "gif" ? (
                    <GifDemo id={message} width={300} />
                  ) : (
                    message
                  )}
                </p>
              </div>
            </div>
          </div>
          <div>
            <div className={classes.messageTimeStampRight}>
              {formatAMPM(timestamp)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

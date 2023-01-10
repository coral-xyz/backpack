import React, { useCallback, useEffect, useState } from "react";
import {
  BACKEND_API_URL,
  Blockchain,
  NAV_COMPONENT_MESSAGE_PROFILE,
} from "@coral-xyz/common";
import { refreshIndividualChatsFor } from "@coral-xyz/db";
import {
  blockchainTokenData,
  SOL_LOGO_URI,
  useActiveSolanaWallet,
  useAnchorContext,
  useBackgroundClient,
  useLoader,
  useNavigation,
  useUser,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { Gif as GifComponent } from "@giphy/react-components";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CallMadeIcon from "@mui/icons-material/CallMade";
import { Skeleton } from "@mui/material";
import Button from "@mui/material/Button";
import { createStyles, makeStyles } from "@mui/styles";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

import {
  cancel,
  getSecureTransferState,
  redeem,
} from "../utils/secure-transfer/secureTransfer";

import { useChatContext } from "./ChatContext";
import { ReplyIcon } from "./Icons";
import { ReplyContainer } from "./ReplyContainer";
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
      cursor: "pointer",
      borderRadius: "50%",
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
    smallBtn: {
      padding: "2px 12px",
      borderRadius: 12,
      cursor: "pointer",
    },
    roundBtn: {
      padding: "2px",
      height: 26,
      width: 26,
      borderRadius: "13px",
    },
    messageLeftContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-start",
      padding: "8px 19px",
    },
    messageLeft: {
      borderRadius: "16px 16px 16px 0px",
      color: theme.custom.colors.fontColor4,
      overflowWrap: "break-word",
      fontSize: 14,
    },
    messageRightContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      padding: "8px 16px",
    },
    messageRight: {
      borderRadius: "16px 16px 0px 16px",
      color: theme.custom.colors.background,
      overflowWrap: "break-word",
      fontSize: 14,
    },
    hoverParent: {
      "&:hover $hoverChild, & .Mui-focused $hoverChild": {
        visibility: "visible",
      },
    },
    hoverChild: {
      visibility: "hidden",
    },
    secureSendOuter: {
      background: theme.custom.colors.invertedPrimary,
      borderRadius: 16,
      padding: "12px 16px",
      color: theme.custom.colors.background,
    },
    secureSendInner: {
      background: theme.custom.colors.invertedSecondary,
      borderRadius: 8,
      padding: "8px 16px",
      color: theme.custom.colors.background,
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

export const MessageLine = (props) => {
  const { push } = useNavigation();
  const message = props.message ? props.message : "";
  const timestamp = props.timestamp
    ? new Date(parseInt(props.timestamp))
    : new Date();
  const { uuid } = useUser();

  const photoURL = props.image;
  const displayName = props.username;
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

  const openProfilePage = (props: { uuid: string }) => {
    if (uuid === props.uuid) {
      return;
    }
    push({
      title: `@${displayName}`,
      componentId: NAV_COMPONENT_MESSAGE_PROFILE,
      componentProps: {
        userId: props.uuid,
      },
    });
  };

  return (
    <>
      <div className={classes.messageRow}>
        {photoURL ? (
          <img
            onClick={() => openProfilePage({ uuid: props.uuid })}
            alt={displayName}
            className={classes.avatar}
            src={photoURL}
          ></img>
        ) : (
          <Skeleton variant="circular" width={40} height={40} />
        )}
        <div className={classes.messageLine}>
          <div>
            <div
              onClick={() => openProfilePage({ uuid: props.uuid })}
              className={classes.displayName}
              style={{ color: props.color, cursor: "pointer" }}
            >
              {displayName ? (
                `@${displayName}`
              ) : (
                <Skeleton width={30} height={20} style={{ marginTop: "0px" }} />
              )}
            </div>
            <div className={classes.messageContainer}>
              <div>
                <p className={classes.messageContent}>
                  {props.messageKind === "gif" ? (
                    <GifDemo id={message} width={220} />
                  ) : props.messageKind === "secure-transfer" ? (
                    <>
                      <SecureTransferElement
                        messageId={props.messageId}
                        senderUuid={props.uuid}
                        escrow={props.metadata.escrow}
                        counter={props.metadata.counter}
                        currentState={props.metadata.current_state}
                        remoteUsername={props.username}
                        finalTxId={props.metadata.final_txn_signature}
                      />
                    </>
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

function SecureTransferElement({
  escrow,
  senderUuid,
  counter,
  messageId,
  currentState,
  remoteUsername,
  finalTxId,
}: {
  escrow: string;
  senderUuid: string;
  counter: number;
  messageId: string;
  currentState: "pending" | "cancelled" | "redeemed";
  remoteUsername: string;
  finalTxId: string;
}) {
  const [currentStateLocal, setCurrentStateLocal] = useState(currentState);
  const { username, uuid } = useUser();
  const [loading, setLoading] = useState(true);
  const { roomId } = useChatContext();
  const { provider, connection } = useAnchorContext();
  const { publicKey } = useActiveSolanaWallet();
  const classes = useStyles();
  const background = useBackgroundClient();
  const [escrowState, setEscrowState] = useState<null | {
    amount: string;
    sender: string;
    receiver: string;
  }>(null);

  useEffect(() => {
    if (!loading && !escrowState && currentStateLocal === "pending") {
      refreshIndividualChatsFor(uuid, roomId, "individual", messageId);
    }
  }, [currentState, messageId, escrowState, loading]);

  useEffect(() => {
    setCurrentStateLocal(currentState);
  }, [currentState]);

  const [token] = useLoader(
    blockchainTokenData({
      publicKey,
      blockchain: Blockchain.SOLANA,
      //@ts-ignore
      tokenAddress: publicKey,
    }),
    null
  );
  const init = async () => {
    const state = await getSecureTransferState(provider, escrow);
    setEscrowState(state);
    setLoading(false);
  };

  useEffect(() => {
    init();
  }, [escrow]);

  return (
    <div className={classes.secureSendOuter}>
      {loading && <div>Loading</div>}
      {!loading && escrowState && (
        <div>
          {uuid === senderUuid ? (
            <div style={{ marginBottom: 5 }}> Sending to @{remoteUsername}</div>
          ) : (
            <div style={{ marginBottom: 5 }}>
              Receiving from @{remoteUsername}
            </div>
          )}
          <div className={classes.secureSendInner}>
            <div style={{ fontSize: 30, display: "flex" }}>
              $
              <div>
                {(
                  ((token?.priceData?.usd || 0) *
                    parseInt(escrowState.amount)) /
                  LAMPORTS_PER_SOL
                ).toFixed(2)}
              </div>
            </div>
            <div style={{ display: "flex", marginTop: 3 }}>
              <img
                src={SOL_LOGO_URI}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 8,
                  marginRight: 5,
                }}
              />{" "}
              <div> {parseInt(escrowState.amount) / LAMPORTS_PER_SOL}</div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: 8,
            }}
          >
            <div
              className={classes.roundBtn}
              style={{ color: "#F8C840", background: "rgba(206, 121, 7, 0.2)" }}
            >
              <AccessTimeIcon style={{ fontSize: 21 }} />
            </div>
            {uuid === senderUuid ? (
              <>
                {" "}
                <div
                  className={classes.smallBtn}
                  style={{
                    background: "rgba(241, 50, 54, 0.2)",
                    color: "#FF6269",
                  }}
                  onClick={async () => {
                    const txn = await cancel(
                      provider,
                      background,
                      connection,
                      new PublicKey(escrowState?.receiver || ""),
                      new PublicKey(escrowState?.sender || ""),
                      new PublicKey(escrow),
                      counter
                    );
                    fetch(
                      `${BACKEND_API_URL}/chat/message?type=individual&room=${roomId}`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          messageId,
                          state: "cancelled",
                          txn,
                        }),
                      }
                    );
                    setCurrentStateLocal("cancelled");
                  }}
                >
                  Cancel
                </div>
              </>
            ) : (
              <>
                <div
                  className={classes.smallBtn}
                  style={{
                    background: "rgba(17, 168, 0, 0.2)",
                    color: "#52D24C",
                  }}
                  onClick={async () => {
                    const txn = await redeem(
                      provider,
                      background,
                      connection,
                      new PublicKey(escrowState.receiver),
                      new PublicKey(escrowState.sender),
                      new PublicKey(escrow),
                      counter
                    );
                    fetch(
                      `${BACKEND_API_URL}/chat/message?type=individual&room=${roomId}`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          messageId,
                          state: "redeemed",
                          txn,
                        }),
                      }
                    );
                    setCurrentStateLocal("redeemed");
                  }}
                >
                  REDEEM
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {!loading && !escrowState && (
        <div style={{ display: "flex" }}>
          {currentStateLocal === "redeemed"
            ? `Escrow redeemed by ${
                remoteUsername === username ? "you" : remoteUsername
              } `
            : `Escrow cancelled by ${
                remoteUsername === username ? "you" : remoteUsername
              }`}
          <div
            className={classes.smallBtn}
            style={{
              padding: "0px 5px",
              background:
                currentStateLocal === "redeemed"
                  ? "rgba(17, 168, 0, 0.2)"
                  : "rgba(241, 50, 54, 0.2)",
              color: currentStateLocal === "redeemed" ? "#52D24C" : "#FF6269",
              marginLeft: 10,
            }}
            onClick={() =>
              window.open(
                `https://explorer.solana.com/tx/${finalTxId}`,
                "mywindow"
              )
            }
          >
            Txn <CallMadeIcon style={{ fontSize: 14 }} />
          </div>
        </div>
      )}
    </div>
  );
}

export function ChatMessages() {
  const { chats, userId } = useChatContext();
  const theme = useCustomTheme();

  return (
    <div style={{ padding: 5 }}>
      {chats.map((chat) => {
        return (
          <MessageLine
            color={chat.color || theme.custom.colors.fontColor2}
            timestamp={chat.created_at}
            key={chat.client_generated_uuid}
            message={chat.message}
            received={chat.received}
            messageKind={chat.message_kind}
            image={chat.image}
            username={chat.username}
            uuid={chat.uuid}
            metadata={chat.message_metadata}
            messageId={chat.client_generated_uuid}
          />
        );
      })}
    </div>
  );

  return (
    <div>
      {chats.map((chat) => {
        if (chat.uuid !== userId) {
          return (
            <>
              <MessageLeft
                timestamp={chat.created_at}
                key={chat.client_generated_uuid}
                message={chat.message}
                received={chat.received}
                messageKind={chat.message_kind}
                image={chat.image}
                username={chat.username}
                userId={chat.uuid}
                client_generated_uuid={chat.client_generated_uuid}
                parent_message_text={chat.parent_message_text}
                parent_message_author_username={
                  "" //TODO: Flow this from userDB
                }
                parent_message_author_uuid={chat.parent_message_author_uuid}
              />
            </>
          );
        }
        return (
          <MessageRight
            timestamp={chat.created_at}
            key={chat.client_generated_uuid}
            message={chat.message}
            received={chat.received}
            userId={chat.uuid}
            messageKind={chat.message_kind}
            image={chat.image}
            username={chat.username}
            client_generated_uuid={chat.client_generated_uuid}
            parent_message_text={chat.parent_message_text}
            parent_message_author_username={""} // TODO: Flow this from user index db
            parent_message_author_uuid={chat.parent_message_author_uuid}
          />
        );
      })}
    </div>
  );
}

function MessageLeft(props) {
  const classes = useStyles();
  const message = props.message ? props.message : "";
  const theme = useCustomTheme();
  const { setActiveReply } = useChatContext();

  return (
    <>
      {props.parent_message_author_uuid && (
        <div style={{ paddingLeft: 19, marginBottom: -10 }}>
          <ReplyContainer
            marginBottom={0}
            parent_username={props.parent_message_author_username || ""}
            showCloseBtn={false}
            text={props.parent_message_text}
          />
        </div>
      )}
      <div className={`${classes.messageLeftContainer} ${classes.hoverParent}`}>
        <div
          className={classes.messageLeft}
          style={{
            maxWidth: props.messageKind === "gif" ? 250 : 200,
            background:
              props.messageKind === "gif"
                ? "transparent"
                : theme.custom.colors.bg4,
            padding: props.messageKind === "gif" ? "0px 0px" : "8px 16px",
          }}
        >
          {props.messageKind === "gif" ? (
            <GifDemo id={message} width={250} />
          ) : (
            message
          )}
        </div>
        {props.messageKind !== "gif" && (
          <div
            style={{ marginLeft: 10, marginTop: 10, cursor: "pointer" }}
            className={classes.hoverChild}
            onClick={() => {
              setActiveReply({
                parent_client_generated_uuid: props.client_generated_uuid,
                text: message,
                parent_username: `@${props.username}`,
                parent_message_author_uuid: props.userId,
              });
            }}
          >
            <ReplyIcon fill={theme.custom.colors.icon} />
          </div>
        )}
      </div>
    </>
  );
}

function MessageRight(props) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const { setActiveReply } = useChatContext();
  const message = props.message ? props.message : "";

  return (
    <>
      {props.parent_message_author_uuid && (
        <div style={{ paddingLeft: 19, marginBottom: -10 }}>
          <ReplyContainer
            align={"right"}
            marginBottom={0}
            parent_username={props.parent_message_author_username || ""}
            showCloseBtn={false}
            text={props.parent_message_text}
          />
        </div>
      )}
      <div className={`${classes.messageRightContainer}`}>
        <div
          className={`${classes.hoverParent}`}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
          }}
        >
          {props.messageKind !== "gif" && (
            <div
              style={{ marginRight: 10, marginTop: 10, cursor: "pointer" }}
              className={classes.hoverChild}
              onClick={() => {
                setActiveReply({
                  parent_client_generated_uuid: props.client_generated_uuid,
                  text: message,
                  parent_message_author_uuid: props.userId,
                  parent_username: "Yourself",
                });
              }}
            >
              <ReplyIcon fill={theme.custom.colors.icon} />
            </div>
          )}
          <div
            className={classes.messageRight}
            style={{
              maxWidth: props.messageKind === "gif" ? 250 : 200,
              background:
                props.messageKind === "gif"
                  ? "transparent"
                  : theme.custom.colors.fontColor2,
              padding: props.messageKind === "gif" ? "0px 0px" : "8px 16px",
            }}
          >
            {props.messageKind === "gif" ? (
              <GifDemo id={message} width={250} />
            ) : (
              message
            )}
          </div>
        </div>
      </div>
    </>
  );
}

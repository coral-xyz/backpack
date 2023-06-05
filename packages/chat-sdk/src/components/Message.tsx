import { useCallback, useEffect, useState } from "react";
import {
  refreshIndividualChatsFor,
  SignalingManager,
} from "@coral-xyz/chat-xplat";
import {
  BACKEND_API_URL,
  BACKPACK_TEAM,
  Blockchain,
  DELETE_MESSAGE,
  formatAmPm,
  NAV_COMPONENT_MESSAGE_PROFILE,
  NEW_COLORS,
} from "@coral-xyz/common";
import {
  BackpackStaffIcon,
  LocalImage,
  SuccessButton,
} from "@coral-xyz/react-common";
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
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CallMadeIcon from "@mui/icons-material/CallMade";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import Info from "@mui/icons-material/Info";
import { Skeleton, Tooltip } from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

import { openWindow } from "../utils/open";
import {
  cancel,
  getSecureTransferState,
  redeem,
} from "../utils/secure-transfer/secureTransfer";

import { BarterModal } from "./barter/BarterModal";
import { BarterPoke } from "./barter/BarterPoke";
import { chatMessageInputId } from "./messageInput/MessageInput";
import { useChatContext } from "./ChatContext";
import { ReplyIcon } from "./Icons";
import { MediaContent } from "./MediaContent";
import { NftStickerRender } from "./NftStickerRender";
import { ParsedMessage } from "./ParsedMessage";
import { ReplyContainer } from "./ReplyContainer";
import { SimpleTransaction } from "./SimpleTransaction";

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
      width: "100%",
      textAlign: "left",
      fontSize: "14px",
      color: theme.custom.colors.fontColor,
    },
    messageContent: {
      padding: 0,
      margin: 0,
    },
    messageTimeStampRight: {
      color: theme.custom.colors.secondary,
      fontSize: 12,
      lineHeight: "15px",
      fontWeight: 500,
      minWidth: 63,
      display: "flex",
      flexDirection: "row-reverse",
      opacity: 0.5,
    },
    avatar: {
      width: 32,
      height: 32,
      cursor: "pointer",
      borderRadius: "50%",
    },
    messageLine: {
      display: "flex",
      justifyContent: "space-between",
      width: "100%",
      color: theme.custom.colors.fontColor2,
    },
    displayName: {
      fontWeight: 600,
      marginLeft: "10px",
      lineHeight: "16px",
      fontSize: "14px",
      fontColor: "#4E5768",
    },
    smallBtn: {
      padding: "2px 12px",
      borderRadius: 12,
      cursor: "pointer",
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
      padding: "8px 10px",
      color: theme.custom.colors.background,
      minWidth: 230,
      maxWidth: 400,
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
  const { isDarkMode, roomId, type } = useChatContext();
  const message = props.message ? props.message : "";
  const timestamp = props.timestamp
    ? new Date(parseInt(props.timestamp))
    : new Date();
  const { uuid } = useUser();

  const photoURL = props.image;
  const displayName = props.username;
  const received = props.received;
  const theme = useCustomTheme();
  const sameUserMessage = props.sameUserMessage;

  const classes = useStyles();
  const { setActiveReply } = useChatContext();

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

  if (props.messageKind === "barter-request") {
    return (
      <BarterPoke sender={props.uuid} barterId={props.metadata?.barter_id} />
    );
  }

  if (props.messageKind === "barter") {
    return <BarterModal barterId={props.metadata?.barter_id} />;
  }

  return (
    <div
      className={classes.messageRow}
      style={{
        marginTop: sameUserMessage ? 0 : 8,
        paddingLeft: sameUserMessage ? 32 : 0,
      }}
    >
      {sameUserMessage ? (
        <div
          className={`${classes.messageContainer} ${classes.hoverParent}`}
          style={{ display: "flex", paddingTop: "4px" }}
        >
          <div style={{ width: "calc(100% - 80px)" }}>
            <div>
              {props.parent_message_author_uuid ? (
                <div>
                  <ReplyContainer
                    marginBottom={2}
                    padding={0}
                    parent_username={props.parent_message_author_username || ""}
                    showCloseBtn={false}
                    text={props.parent_message_text}
                  />
                </div>
              ) : null}
              <div style={{ display: "flex" }}>
                <div>
                  <p className={classes.messageContent}>
                    {props.deleted ? (
                      <DeletedMessage />
                    ) : props.messageKind === "gif" ? (
                      <div
                        style={{
                          height: 150,
                          maxWidth: 220,
                          overflow: "hidden",
                        }}
                      >
                        <GifDemo id={message} height={150} />
                      </div>
                    ) : props.messageKind === "secure-transfer" ? (
                      <SecureTransferElement
                        messageId={props.messageId}
                        senderUuid={props.uuid}
                        escrow={props.metadata.escrow}
                        counter={props.metadata.counter}
                        currentState={props.metadata.current_state}
                        remoteUsername={props.username}
                        finalTxId={props.metadata.final_txn_signature}
                      />
                    ) : props.messageKind === "transaction" ? (
                      <SimpleTransaction
                        remoteUserId={props.uuid}
                        message={message}
                        txnSignature={props.metadata?.final_tx_signature}
                      />
                    ) : props.messageKind === "media" ? (
                      <div>
                        <MediaContent
                          mediaLink={props.metadata?.media_link}
                          mediaKind={props.metadata?.media_kind}
                        />
                        <ParsedMessage message={message} />
                      </div>
                    ) : props.messageKind === "nft-sticker" ? (
                      <div>
                        <NftStickerRender
                          uuid={props.uuid}
                          mint={props.metadata?.mint}
                          displayName={displayName}
                        />
                      </div>
                    ) : (
                      <ParsedMessage message={message} />
                    )}
                  </p>
                </div>
                {!props.deleted ? (
                  <div>
                    {props.messageKind === "text" ? (
                      <div
                        style={{ display: "flex" }}
                        className={classes.hoverChild}
                      >
                        <div
                          style={{
                            marginLeft: 10,
                            marginTop: 3,
                            cursor: "pointer",
                            marginRight: 5,
                          }}
                          onClick={() => {
                            setActiveReply({
                              parent_client_generated_uuid:
                                props.client_generated_uuid,
                              text: message,
                              parent_username: `@${props.username}`,
                              parent_message_author_uuid: props.userId,
                            });
                            document
                              .getElementById(chatMessageInputId)
                              ?.focus();
                          }}
                        >
                          <ReplyIcon fill={theme.custom.colors.icon} />
                        </div>
                        <div style={{ marginLeft: 3 }}>
                          <DeleteIconInternal
                            client_generated_uuid={props.client_generated_uuid}
                            messageSender={props.uuid}
                          />
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{ marginLeft: 5 }}
                        className={classes.hoverChild}
                      >
                        {" "}
                        <DeleteIconInternal
                          client_generated_uuid={props.client_generated_uuid}
                          messageSender={props.uuid}
                        />{" "}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              paddingTop: 8,
              width: 32,
            }}
          >
            {photoURL ? (
              <LocalImage
                size={32}
                onClick={() => openProfilePage({ uuid: props.uuid })}
                alt={displayName}
                className={classes.avatar}
                style={{ width: 32, height: 32 }}
                src={photoURL}
              />
            ) : (
              <Skeleton
                variant="circular"
                width={32}
                height={32}
                style={{
                  minWidth: 32,
                }}
              />
            )}
          </div>
          <div className={`${classes.messageLine} ${classes.hoverParent}`}>
            <div style={{ width: "calc(100% - 80px)" }}>
              <div
                onClick={() => openProfilePage({ uuid: props.uuid })}
                className={classes.displayName}
                style={{
                  display: "inline-flex",
                  paddingBottom: "4px",
                  color:
                    props.colorIndex || props.colorIndex === 0
                      ? NEW_COLORS[props.colorIndex || 0][
                          isDarkMode ? "dark" : "light"
                        ]
                      : props.color,
                  cursor: "pointer",
                }}
              >
                {displayName ? (
                  <div style={{ display: "flex" }}>
                    <div>@{displayName} </div>{" "}
                    {BACKPACK_TEAM.includes(props.uuid) ? (
                      <BackpackStaffIcon />
                    ) : null}
                  </div>
                ) : (
                  <Skeleton
                    width={50}
                    height={16}
                    style={{ marginTop: "0px" }}
                  />
                )}
              </div>
              <div
                className={`${classes.messageContainer} ${classes.hoverParent}`}
                style={{ display: "flex" }}
              >
                <div>
                  {props.parent_message_author_uuid ? (
                    <div style={{}}>
                      <ReplyContainer
                        marginBottom={0}
                        padding={0}
                        parent_username={
                          props.parent_message_author_username || ""
                        }
                        showCloseBtn={false}
                        text={props.parent_message_text}
                      />
                    </div>
                  ) : null}
                  <div>
                    <p className={classes.messageContent}>
                      {props.deleted ? (
                        <DeletedMessage />
                      ) : props.messageKind === "gif" ? (
                        <div
                          style={{
                            height: 150,
                            maxWidth: 220,
                            overflow: "hidden",
                          }}
                        >
                          <GifDemo id={message} height={150} />
                        </div>
                      ) : props.messageKind === "secure-transfer" ? (
                        <SecureTransferElement
                          messageId={props.messageId}
                          senderUuid={props.uuid}
                          escrow={props.metadata.escrow}
                          counter={props.metadata.counter}
                          currentState={props.metadata.current_state}
                          remoteUsername={props.username}
                          finalTxId={props.metadata.final_txn_signature}
                        />
                      ) : props.messageKind === "transaction" ? (
                        <SimpleTransaction
                          remoteUserId={props.uuid}
                          message={message}
                          txnSignature={props.metadata?.final_tx_signature}
                        />
                      ) : props.messageKind === "nft-sticker" ? (
                        <div>
                          <NftStickerRender
                            mint={props.metadata?.mint}
                            uuid={props.uuid}
                            displayName={displayName}
                          />
                        </div>
                      ) : props.messageKind === "media" ? (
                        <div>
                          <MediaContent
                            mediaLink={props.metadata?.media_link}
                            mediaKind={props.metadata?.media_kind}
                          />

                          <ParsedMessage message={message} />
                        </div>
                      ) : (
                        <ParsedMessage message={message} />
                      )}
                    </p>
                  </div>
                </div>

                {!props.deleted ? (
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    {props.messageKind === "text" ? (
                      <div
                        style={{ display: "flex" }}
                        className={classes.hoverChild}
                      >
                        <div
                          style={{
                            marginLeft: 10,
                            marginTop: 3,
                            cursor: "pointer",
                          }}
                          className={classes.hoverChild}
                          onClick={() => {
                            setActiveReply({
                              parent_client_generated_uuid:
                                props.client_generated_uuid,
                              text: message,
                              parent_username: `@${props.username}`,
                              parent_message_author_uuid: props.userId,
                            });
                            document
                              .getElementById(chatMessageInputId)
                              ?.focus();
                          }}
                        >
                          <ReplyIcon fill={theme.custom.colors.icon} />
                        </div>
                        <div style={{ marginLeft: 3 }}>
                          <DeleteIconInternal
                            client_generated_uuid={props.client_generated_uuid}
                            messageSender={props.uuid}
                          />
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{ marginLeft: 5 }}
                        className={classes.hoverChild}
                      >
                        {" "}
                        <DeleteIconInternal
                          client_generated_uuid={props.client_generated_uuid}
                          messageSender={props.uuid}
                        />{" "}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
            <div style={{ minWidth: 63 }}>
              <div className={classes.messageTimeStampRight}>
                {formatAmPm(timestamp)}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row-reverse",
                  marginTop: 5,
                }}
              >
                {received ? (
                  <DoneAllIcon
                    style={{
                      fontSize: 13,
                      color: "green",
                    }}
                  />
                ) : (
                  <DoneIcon
                    style={{ color: theme.custom.colors.icon, fontSize: 13 }}
                  />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
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
  const [finalTxIdLocal, setFinalTxIdLocal] = useState(finalTxId);
  const { username, uuid } = useUser();
  const [loading, setLoading] = useState(true);
  const { roomId } = useChatContext();
  const { provider, connection } = useAnchorContext();
  const activeSolanaWallet = useActiveSolanaWallet();
  const theme = useCustomTheme();
  const classes = useStyles();
  const background = useBackgroundClient();
  const [actionButtonLoading, setActionButtonLoading] = useState(false);
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

  useEffect(() => {
    if (finalTxId) {
      setFinalTxIdLocal(finalTxId);
    }
  }, [finalTxId]);

  const [token] = useLoader(
    blockchainTokenData({
      publicKey: activeSolanaWallet?.publicKey,
      blockchain: Blockchain.SOLANA,
      //@ts-ignore
      tokenAddress: activeSolanaWallet?.publicKey,
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
    <div className={classes.secureSendOuter} id="asdasd">
      {loading ? <div>Loading</div> : null}
      {!loading && escrowState ? (
        <div style={{ paddingLeft: 5, paddingRight: 5 }}>
          {uuid === senderUuid ? (
            <div
              style={{
                display: "flex",
                color: theme.custom.colors.icon,
                marginBottom: 5,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  marginRight: 3,
                }}
              >
                <ArrowUpwardIcon
                  style={{ color: theme.custom.colors.icon, fontSize: 15 }}
                />
              </div>
              <div> Sending to @{remoteUsername}</div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                color: theme.custom.colors.icon,
                marginBottom: 5,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  marginRight: 3,
                }}
              >
                <ArrowDownwardIcon
                  style={{ color: theme.custom.colors.icon, fontSize: 15 }}
                />
              </div>
              <div>Payment from @{remoteUsername}</div>
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
            {uuid === senderUuid ? (
              <div>
                {!actionButtonLoading ? (
                  <div
                    style={{
                      color: "#F8C840",
                      background: "rgba(206, 121, 7, 0.2)",
                      borderRadius: 16,
                      padding: "4px 10px",
                      display: "flex",
                    }}
                  >
                    {/*<div style={{justifyContent: "center", flexDirection: "column", display: "flex"}}>*/}
                    {/*  <AccessTimeIcon style={{ fontSize: 18 }} />*/}
                    {/*</div>*/}
                    <div
                      style={{
                        marginLeft: 5,
                        justifyContent: "center",
                        flexDirection: "column",
                        display: "flex",
                      }}
                    >
                      Waiting for {remoteUsername}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
            {uuid === senderUuid ? (
              <>
                {" "}
                <div
                  style={{
                    color: theme.custom.colors.background,
                    cursor: actionButtonLoading ? "auto" : "pointer",
                    fontSize: 15,
                    marginTop: 2,
                  }}
                  onClick={async () => {
                    setActionButtonLoading(true);
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
                    setFinalTxIdLocal(txn);
                    setCurrentStateLocal("cancelled");
                    setEscrowState(null);
                    setActionButtonLoading(false);
                  }}
                >
                  {!actionButtonLoading ? "Cancel" : "Cancelling..."}
                </div>
              </>
            ) : (
              <SuccessButton
                style={{ height: 38 }}
                onClick={async () => {
                  setActionButtonLoading(true);
                  try {
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
                    setFinalTxIdLocal(txn);
                    setCurrentStateLocal("redeemed");
                    setEscrowState(null);
                    setActionButtonLoading(false);
                  } catch (e) {
                    console.error(e);
                    setActionButtonLoading(false);
                  }
                }}
                label={!actionButtonLoading ? "Accept" : "Accepting..."}
              />
            )}
          </div>
        </div>
      ) : null}
      {!loading && !escrowState ? (
        <div style={{ fontSize: 14 }}>
          <div>
            {currentStateLocal === "redeemed"
              ? `Escrow redeemed by ${
                  remoteUsername !== username ? "you" : remoteUsername
                } `
              : `Escrow cancelled by ${
                  remoteUsername === username ? "you" : remoteUsername
                }`}
          </div>
          <div style={{ display: "flex", flexDirection: "row-reverse" }}>
            <div
              className={classes.smallBtn}
              style={{
                display: "flex",
                marginTop: 4,
                padding: "3px 7px",
                fontSize: 12,
                background:
                  currentStateLocal === "redeemed"
                    ? "rgba(17, 168, 0, 0.2)"
                    : "rgba(241, 50, 54, 0.2)",
                color: currentStateLocal === "redeemed" ? "#52D24C" : "#FF6269",
                marginLeft: 10,
              }}
              onClick={() =>
                openWindow(
                  `https://explorer.solana.com/tx/${finalTxIdLocal}`,
                  "mywindow"
                )
              }
            >
              <div>Txn </div>
              <CallMadeIcon style={{ fontSize: 15 }} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ChatMessages() {
  const { chats, userId } = useChatContext();
  const theme = useCustomTheme();

  return (
    <div style={{ paddingLeft: 18, paddingRight: 18 }}>
      {chats.map((chat, index) => {
        return (
          <MessageLine
            key={chat.client_generated_uuid}
            received={chat.received}
            sameUserMessage={
              chats[index]?.uuid && index > 0 && index < chats.length
                ? chats[index]?.uuid === chats[index - 1]?.uuid
                : null
            }
            parent_message_author_username={chat.parent_message_author_username}
            parent_message_text={chat.parent_message_text}
            parent_message_author_uuid={chat.parent_message_author_uuid}
            client_generated_uuid={chat.client_generated_uuid}
            color={chat.color || theme.custom.colors.fontColor2}
            colorIndex={chat.colorIndex}
            timestamp={chat.created_at}
            message={chat.message}
            deleted={chat.deleted}
            messageKind={chat.message_kind}
            image={chat.image}
            username={chat.username}
            uuid={chat.uuid}
            userId={chat.uuid}
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
            parent_message_author_username="" // TODO: Flow this from user index db
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
      {props.parent_message_author_uuid ? (
        <div style={{ paddingLeft: 19, marginBottom: -10 }}>
          <ReplyContainer
            marginBottom={0}
            padding={0}
            parent_username={props.parent_message_author_username || ""}
            showCloseBtn={false}
            text={props.parent_message_text}
          />
        </div>
      ) : null}
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
            <GifDemo id={message} height={150} />
          ) : (
            message
          )}
        </div>
        {!props.deleted && props.messageKind === "text" ? (
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
              document.getElementById(chatMessageInputId)?.focus();
            }}
          >
            <ReplyIcon fill={theme.custom.colors.icon} />
          </div>
        ) : null}
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
      {props.parent_message_author_uuid ? (
        <div style={{ paddingLeft: 19, marginBottom: -10 }}>
          <ReplyContainer
            align="right"
            marginBottom={0}
            padding={0}
            parent_username={props.parent_message_author_username || ""}
            showCloseBtn={false}
            text={props.parent_message_text}
          />
        </div>
      ) : null}
      <div className={`${classes.messageRightContainer}`}>
        <div
          className={`${classes.hoverParent}`}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
          }}
        >
          {!props.deleted && props.messageKind !== "gif" ? (
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
                document.getElementById(chatMessageInputId)?.focus();
              }}
            >
              <ReplyIcon fill={theme.custom.colors.icon} />
            </div>
          ) : null}
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

function DeleteIconInternal({
  client_generated_uuid,
  messageSender,
}: {
  client_generated_uuid: string;
  messageSender: string;
}) {
  const { roomId, type } = useChatContext();
  const theme = useCustomTheme();
  const { uuid } = useUser();

  return (
    <div>
      {BACKPACK_TEAM.includes(uuid) ? (
        <DeleteIcon
          style={{ color: theme.custom.colors.icon, cursor: "pointer" }}
          onClick={() => {
            SignalingManager.getInstance().send({
              type: DELETE_MESSAGE,
              payload: {
                client_generated_uuid: client_generated_uuid,
                room: roomId,
                type: type,
              },
            });
          }}
        />
      ) : null}
    </div>
  );
}

function DeletedMessage() {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        background: theme.custom.colors.background,
        color: theme.custom.colors.icon,
        borderRadius: 5,
        display: "inline-flex",
        padding: "2px 6px",
        marginLeft: -6,
        alignItems: "center",
      }}
    >
      <span>Message removed</span>
      <Tooltip title="This was probably spam">
        <Info
          style={{
            fontSize: "1rem",
            marginLeft: 4,
            color: theme.custom.colors.icon,
          }}
        />
      </Tooltip>
    </div>
  );
}

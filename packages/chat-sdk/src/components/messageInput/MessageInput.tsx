import { useEffect, useRef, useState } from "react";
import { BACKEND_API_URL } from "@coral-xyz/common";

import { useChatContext } from "../ChatContext";

import { getActiveToken } from "./getActiveToken";
import { getCaretIndex } from "./getCaretIndex";

export function MessageInput() {
  const [messageContent, setMessageContent] = useState<string | null>("");
  const [tagMembers, setTagMembers] = useState([]);
  const inputRef = useRef<any>(null);
  const { remoteUserId, roomId, activeReply, setActiveReply, type, chats } =
    useChatContext();
  // const [autoCompleteOpen, setAutocompleteOpen] = useState(false);

  async function onInputNavigate(e) {
    if (!inputRef.current) {
      return;
    }
    const caretPos = getCaretIndex(inputRef.current);
    if (inputRef.current.contains(e.target)) {
      const activeToken = getActiveToken(
        inputRef.current.textContent,
        caretPos
      )?.word;
      if (activeToken?.startsWith("@")) {
        try {
          const res = await fetch(
            `${BACKEND_API_URL}/nft/members?type=${type}limit=4&room=${roomId}&prefix=${activeToken.slice(
              1
            )}`
          );
          const json = await res.json();
          setTagMembers(json.members);
        } catch (e) {
          console.error(e);
        }
      } else {
        setTagMembers([]);
      }
    } else {
      setTagMembers([]);
    }
  }

  useEffect(() => {
    if (inputRef && inputRef.current) {
      document.addEventListener("click", (e) => onInputNavigate(e));
      document.addEventListener("keyup", (e) => onInputNavigate(e));
    }
    return () => {
      document.addEventListener("click", (e) => onInputNavigate(e));
      document.addEventListener("keyup", (e) => onInputNavigate(e));
    };
  }, [inputRef]);

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }
    const caretPos = getCaretIndex(inputRef.current);
    inputRef.current.innerHTML = messageContent;
    inputRef.current.focus();
    const setpos = document.createRange();
    const set = window.getSelection();
    setpos.setStart(inputRef.current, caretPos || 0);
    setpos.collapse(true);
    set?.removeAllRanges();
    set?.addRange(setpos);
    inputRef.current.focus();
  }, [messageContent, inputRef]);

  return (
    <>
      {JSON.stringify(tagMembers)}
      <p
        id={"text-input"}
        ref={inputRef}
        onInput={(e) => {
          setMessageContent(e.currentTarget.textContent);
        }}
        style={{
          width: "100%",
          height: 20,
          margin: 0,
          marginBottom: 10,
          outline: "none",
        }}
        contentEditable="true"
      ></p>
    </>
  );
}

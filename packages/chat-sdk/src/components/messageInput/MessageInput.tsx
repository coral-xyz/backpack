import { useEffect,useRef, useState } from "react";

import { getActiveToken } from "./getActiveToken";
import { getCaretIndex } from "./getCaretIndex";

export function MessageInput() {
  const [_, setMessageContent] = useState("");
  const inputRef = useRef<any>(null);
  // const [autoCompleteOpen, setAutocompleteOpen] = useState(false);

  function onInputNavigate(e) {
    if (!inputRef.current) {
      return;
    }
    const caretPos = getCaretIndex(inputRef.current);
    if (inputRef.current.contains(e.target)) {
      const activeToken = getActiveToken(
        inputRef.current.textContent,
        caretPos
      )?.word;
      // if (activeToken?.startsWith("@")) {
      //
      // }
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

  return (
    <>
      <div
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
      ></div>
    </>
  );
}

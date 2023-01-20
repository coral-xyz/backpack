import { Fragment,useContext, useEffect, useRef, useState } from "react";
import {
  RichMentionsContext,
  RichMentionsInput,
  RichMentionsProvider,
} from "react-rich-mentions";
import { useLocation } from "react-router-dom";
import type { RemoteUserData } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import {
  useActiveSolanaWallet,
  useDecodedSearchParams,
} from "@coral-xyz/recoil";

import { useChatContext } from "../ChatContext";

const list = ["adrien", "anna", "guillaume", "vincent", "victor"].map(
  (v, i) => ({
    name: v,
    ref: `<@${v}|u${i + 1}>`,
  })
);

export function MessageInput({ inputRef }: { inputRef: any }) {
  const defaultValue = "";
  const pathname = useLocation().pathname;
  const { type, remoteUsername, remoteUserId } = useChatContext();
  const { props }: any = useDecodedSearchParams();
  const { publicKey } = useActiveSolanaWallet();

  const configs = [
    {
      query: /@([a-zA-Z0-9_-]+)?/,
      match: /<(@\w+)\|([^>]+)>/g,
      matchDisplay: "$1",
      customizeFragment: (fragment, final) => {
        fragment.className = final ? "final" : "pending";
      },
      onMention: async (text) => {
        const search = text.substr(1); // remove '@'
        if (type === "individual") {
          return [
            {
              name: remoteUsername,
              ref: `<@${remoteUsername}|u${remoteUserId}>`,
            },
          ].filter((x) => x.name?.includes(search));
        }
        const response = await fetch(
          `${BACKEND_API_URL}/nft/members?room=${
            pathname === "/messages/groupchat" ? props.id : props.collectionId
          }&mint=${
            props.nftMint
          }&publicKey=${publicKey}&type=collection&limit=${3}prefix=${search}`,
          {
            method: "GET",
          }
        );
        try {
          const json = await response.json();
          const members: RemoteUserData[] = json?.members || [];
          return members.map((x) => ({
            name: x.username,
            ref: `<@${x.username}|u${x.id}>`,
          }));
        } catch (e) {
          console.error(e);
          return [];
        }
      },
      // onChange: {
      //   console.log("Chaning")z
      // }
    },
  ];

  return (
    <div style={{ width: "100%" }}>
      <RichMentionsProvider
        configs={configs}
        getContext={inputRef}
        onChange={(e) => e.stopPropagation()}
      >
        <RichMentionsInput defaultValue={defaultValue} />
        {/* <RichMentionsAutocomplete /> */}
        <CustomAutoComplete />
      </RichMentionsProvider>
    </div>
  );
}

const CustomAutoComplete = () => {
  const {
    opened,
    index,
    //loading,
    results,
    setActiveItemIndex,
    selectItem,
    setPositionFixed,
  } = useContext(RichMentionsContext);

  useEffect(() => {
    console.log({
      opened,
      results,
    });
  }, [opened, results]);

  return (
    <Fragment
      onClick={() => selectItem({ name: "adrien", ref: "<@adrien|u1>" })}
    >
      {results.map((item, i) => (
        <button
          className={`autocomplete-item ${
            i === index ? "autocomplete-item-selected" : ""
          }`}
          type="button"
          key={item.ref}
          onClick={() => selectItem(item)}
        >
          {item.name}
        </button>
      ))}
    </Fragment>
  );
};

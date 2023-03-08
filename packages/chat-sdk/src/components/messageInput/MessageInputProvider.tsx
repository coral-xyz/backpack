import { useEffect, useState } from "react";
import { RichMentionsProvider } from "react-rich-mentions";
import { useLocation } from "react-router-dom";
import type { RemoteUserData } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import {
  useActiveSolanaWallet,
  useDecodedSearchParams,
} from "@coral-xyz/recoil";

import { useChatContext } from "../ChatContext";

export const MessageInputProvider = ({
  inputRef,
  children,
  offlineMembers,
}: {
  inputRef: any;
  children: any;
  offlineMembers: any[];
}) => {
  const pathname = useLocation().pathname;
  const { type, remoteUsername, remoteUserId } = useChatContext();
  const { roomId } = useChatContext();
  const { props }: any = useDecodedSearchParams();
  const [rerender, setRender] = useState(false);
  const configs: any = [
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
          return offlineMembers
            .map((x) => ({
              name: x.username,
              id: x.uuid,
              ref: `<@${x.username}|u${x.uuid}>`,
            }))
            .filter((x) => x.name.includes(search));
        }
        if (search.length <= 1) {
          return offlineMembers
            .map((x) => ({
              name: x.username,
              id: x.uuid,
              ref: `<@${x.username}|u${x.uuid}>`,
            }))
            .filter((x) => x.name.includes(search));
        }
        const response = await fetch(
          `${BACKEND_API_URL}/nft/members?room=${
            pathname === "/messages/groupchat" ? props.id : props.collectionId
          }&mint=${props.nftMint}&type=collection&limit=${3}&prefix=${search}`,
          {
            method: "GET",
          }
        );
        try {
          const json = await response.json();
          const members: RemoteUserData[] = json?.members || [];
          return [
            ...offlineMembers
              .map((x) => ({
                name: x.username,
                id: x.uuid,
                ref: `<@${x.username}|u${x.uuid}>`,
              }))
              .filter((x) => x.name.includes(search)),
            ...members.map((x) => ({
              name: x.username,
              id: x.id,
              ref: `<@${x.username}|u${x.id}>`,
            })),
          ];
        } catch (e) {
          console.error(e);
          return [];
        }
      },
    },
  ];

  useEffect(() => {
    setRender(true);
    setTimeout(() => {
      setRender(false);
    }, 10);
  }, [roomId]);

  if (rerender || (offlineMembers.length && !offlineMembers[0]?.username)) {
    return <>{children}</>;
  }

  return (
    <RichMentionsProvider configs={configs} getContext={inputRef}>
      {children}
    </RichMentionsProvider>
  );
};

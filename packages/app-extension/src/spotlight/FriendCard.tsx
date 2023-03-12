import { useEffect,useState  } from "react";
import {
  NAV_COMPONENT_MESSAGE_CHAT,
  NAV_COMPONENT_MESSAGE_PROFILE,
  TAB_MESSAGES,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
} from "@coral-xyz/common";
import { useBackgroundClient, useNavigation } from "@coral-xyz/recoil";

import { ActionRow } from "./ActionRow";
import { GroupIdentifier } from "./GroupIdentifier";
import { SpotlightContact } from "./SpotlightContacts";

export const FriendCard = ({
  friend,
  setOpen,
}: {
  friend: { username: string; image: string; uuid: string };
  setOpen: any;
}) => {
  const [arrowIndex, setArrowIndex] = useState<number | null>(null);
  const background = useBackgroundClient();
  const { push, toRoot } = useNavigation();

  useEffect(() => {
    async function keyDownTextField(e: any) {
      if (e.which === 38) {
        setArrowIndex((x) => (x === null ? 0 : x - 1));
      } else if (e.which === 40) {
        setArrowIndex((x) => (x === null ? 0 : x + 1));
      }
      if ((e.key === "Enter" || e.key === "Return") && arrowIndex !== null) {
        await toRoot();
        await background.request({
          method: UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
          params: [TAB_MESSAGES],
        });
        if (arrowIndex !== null && arrowIndex !== -1 && arrowIndex % 2 === 0) {
          push({
            title: `@${friend.username}`,
            componentId: NAV_COMPONENT_MESSAGE_CHAT,
            componentProps: {
              userId: friend?.uuid,
              id: friend?.uuid,
              username: friend?.username,
            },
          });
        } else {
          push({
            title: `@${friend?.username}`,
            componentId: NAV_COMPONENT_MESSAGE_PROFILE,
            componentProps: {
              userId: friend?.uuid,
            },
          });
        }
        setOpen(false);
      }
    }
    document.addEventListener("keydown", keyDownTextField);

    return () => {
      document.removeEventListener("keydown", keyDownTextField);
    };
  }, [arrowIndex, friend]);

  return (
    <div>
      <GroupIdentifier name="Friends" />
      <SpotlightContact
        setSelectedContact={() => {}}
        contact={friend}
        selected={false}
      />

      <ActionRow
        selected={(arrowIndex !== null && arrowIndex % 2) === 0}
        title="Send a message"
        onClick={async () => {
          await toRoot();
          await background.request({
            method: UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
            params: [TAB_MESSAGES],
          });

          push({
            title: `@${friend.username}`,
            componentId: NAV_COMPONENT_MESSAGE_CHAT,
            componentProps: {
              userId: friend?.uuid,
              id: friend?.uuid,
              username: friend?.username,
            },
          });
          setOpen(false);
        }}
      />
      <ActionRow
        selected={(arrowIndex !== null && arrowIndex % 2) === 1}
        title="Go to profile"
        onClick={async () => {
          await toRoot();
          await background.request({
            method: UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
            params: [TAB_MESSAGES],
          });

          push({
            title: `@${friend?.username}`,
            componentId: NAV_COMPONENT_MESSAGE_PROFILE,
            componentProps: {
              userId: friend?.uuid,
            },
          });
          setOpen(false);
        }}
      />
    </div>
  );
};

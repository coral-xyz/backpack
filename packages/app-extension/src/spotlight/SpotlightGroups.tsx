import { NAV_COMPONENT_MESSAGE_GROUP_CHAT } from "@coral-xyz/common";
import { UserIcon } from "@coral-xyz/react-common";
import { useNavigation } from "@coral-xyz/recoil";

import { GroupIdentifier } from "./GroupIdentifier";
import { SpotlightCell } from "./SpotlightCell";

export const SpotlightGroups = ({
  groups,
  selectedIndex,
  setOpen,
}: {
  groups: {
    name: string;
    image: string;
    collectionId: string;
  }[];
  selectedIndex: number | null;
  setOpen: any;
}) => {
  if (!groups.length) return null;
  return (
    <div>
      <GroupIdentifier name="Group chats" />
      {groups.map((group, index) => (
        <SpotlightGroup
          group={group}
          selected={selectedIndex === index}
          setOpen={setOpen}
        />
      ))}
    </div>
  );
};

function SpotlightGroup({
  group,
  selected,
  setOpen,
}: {
  group: { name: string; image: string; collectionId: string };
  selected: boolean;
  setOpen: any;
}) {
  const { push } = useNavigation();

  return (
    <SpotlightCell
      selected={selected}
      onClick={() => {
        push({
          title: group?.name,
          componentId: NAV_COMPONENT_MESSAGE_GROUP_CHAT,
          componentProps: {
            fromInbox: true,
            id: group.collectionId,
            title: group?.name,
          },
        });
        setOpen(false);
      }}
    >
      <UserIcon size={55} image={group.image} />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        {group.name}
      </div>
    </SpotlightCell>
  );
}

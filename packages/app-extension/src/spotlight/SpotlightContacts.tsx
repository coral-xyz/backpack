import { UserIcon } from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";

import { SELECTED_BLUE } from "./colors";
import { GroupIdentifier } from "./GroupIdentifier";

export const SpotlightContacts = ({
  contacts,
  selectedIndex,
  setSelectedContact,
}: {
  selectedIndex: number | null;
  contacts: {
    username: string;
    image: string;
    uuid: string;
  }[];
  setSelectedContact: any;
}) => {
  if (!contacts.length) return null;
  return (
    <div>
      <GroupIdentifier name="Friends" />
      {contacts.map((contact, index) => (
        <SpotlightContact
          selected={selectedIndex === index}
          contact={contact}
          setSelectedContact={setSelectedContact}
        />
      ))}
    </div>
  );
};

export function SpotlightContact({
  contact,
  selected,
  setSelectedContact,
}: {
  contact: {
    username: string;
    image: string;
    uuid: string;
  };
  selected: boolean;
  setSelectedContact: any;
}) {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        display: "flex",
        padding: 12,
        background: selected ? SELECTED_BLUE : "",
        borderRadius: 8,
        color: theme.custom.colors.fontColor,
        cursor: "pointer",
      }}
      onClick={() => {
        setSelectedContact(contact);
      }}
    >
      <UserIcon size={55} image={contact.image} />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        {contact.username}
      </div>
    </div>
  );
}

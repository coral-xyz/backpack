import { UserIcon } from "@coral-xyz/react-common";

import { GroupIdentifier } from "./GroupIdentifier";
import { SpotlightCell } from "./SpotlightCell";

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

function SpotlightContact({
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
  return (
    <SpotlightCell
      selected={selected}
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
    </SpotlightCell>
  );
}

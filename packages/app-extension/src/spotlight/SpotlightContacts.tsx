import { GroupIdentifier } from "./GroupIdentifier";

export const SpotlightContacts = ({
  contacts,
}: {
  contacts: {
    username: string;
    image: string;
    uuid: string;
  }[];
}) => {
  if (!contacts.length) return null;
  return (
    <div>
      <GroupIdentifier name="Friends" />
      {contacts.map((contact) => (
        <SpotlightContact contact={contact} />
      ))}
    </div>
  );
};

function SpotlightContact({
  contact,
}: {
  contact: {
    username: string;
    image: string;
    uuid: string;
  };
}) {
  return <div>{contact.username}</div>;
}

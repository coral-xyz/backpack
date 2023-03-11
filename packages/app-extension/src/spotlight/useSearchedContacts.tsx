import { useContacts } from "@coral-xyz/db";
import { useUser } from "@coral-xyz/recoil";

export const useSearchedContacts = (searchFilter: string) => {
  const { uuid } = useUser();
  const contacts = useContacts(uuid);

  return contacts
    .filter((x) =>
      x.remoteUsername?.toLowerCase().includes(searchFilter?.toLowerCase())
    )
    .map((x) => ({
      username: x.remoteUsername,
      image: x.remoteUserImage,
      uuid: x.remoteUserId,
    }));
};

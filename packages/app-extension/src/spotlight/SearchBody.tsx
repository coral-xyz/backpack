import { SpotlightContacts } from "./SpotlightContacts";
import { SpotlightGroups } from "./SpotlightGroups";
import { useSearchedContacts } from "./useSearchedContacts";
import { useSearchedGroupsCollections } from "./useSearchedGroups";

export const SearchBody = ({ searchFilter }: { searchFilter: string }) => {
  const contacts = useSearchedContacts(searchFilter);
  const groups = useSearchedGroupsCollections(searchFilter);

  if (!searchFilter) return <div>Try searching armani...</div>;

  return (
    <div>
      <SpotlightContacts contacts={contacts} />
      <SpotlightGroups groups={groups} />
    </div>
  );
};

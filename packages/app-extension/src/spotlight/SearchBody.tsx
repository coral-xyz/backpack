import { SpotlightContacts } from "./SpotlightContacts";
import { SpotlightGroups } from "./SpotlightGroups";
import { SpotlightNfts } from "./SpotlightNfts";
import { SpotlightTokens } from "./SpotlightTokens";
import { useSearchedContacts } from "./useSearchedContacts";
import { useSearchedGroupsCollections } from "./useSearchedGroups";
import { useSearchedNfts } from "./useSearchedNfts";
import { useSearchedTokens } from "./useSearchedTokens";
import { getCurrentCounter } from "./utils";

export const SearchBody = ({
  searchFilter,
  arrowIndex,
  setOpen,
  setSelectedContact,
}: {
  searchFilter: string;
  arrowIndex: number;
  setOpen: any;
  setSelectedContact: any;
}) => {
  const contacts = useSearchedContacts(searchFilter);
  const groups = useSearchedGroupsCollections(searchFilter);
  const nfts = useSearchedNfts(searchFilter);
  const tokens = useSearchedTokens(searchFilter);
  const allResultsLength =
    contacts.length + groups.length + nfts.length + tokens.length;
  const currentCounter = getCurrentCounter(arrowIndex, allResultsLength);

  if (!searchFilter) return <div />;

  return (
    <div>
      <div>
        <SpotlightContacts
          selectedIndex={
            currentCounter < contacts.length ? currentCounter : null
          }
          contacts={contacts}
          setSelectedContact={setSelectedContact}
        />
      </div>
      <div style={{ marginTop: 10 }}>
        <SpotlightGroups
          selectedIndex={
            currentCounter >= contacts.length &&
            currentCounter < contacts.length + groups.length
              ? currentCounter - contacts.length
              : null
          }
          groups={groups}
          setOpen={setOpen}
        />
      </div>
      <div style={{ marginTop: 10 }}>
        <SpotlightNfts
          selectedIndex={
            currentCounter >= contacts.length + groups.length &&
            currentCounter < contacts.length + groups.length + nfts.length
              ? currentCounter - contacts.length - groups.length
              : null
          }
          nfts={nfts}
          setOpen={setOpen}
        />
      </div>
      <div style={{ marginTop: 10 }}>
        <SpotlightTokens
          selectedIndex={
            currentCounter >= contacts.length + groups.length + nfts.length &&
            currentCounter <
              contacts.length + groups.length + nfts.length + tokens.length
              ? currentCounter - contacts.length - groups.length - nfts.length
              : null
          }
          tokens={tokens}
          setOpen={setOpen}
        />
      </div>
    </div>
  );
};

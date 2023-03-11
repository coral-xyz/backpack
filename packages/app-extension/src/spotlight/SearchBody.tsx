import { useCustomTheme } from "@coral-xyz/themes";
import { Divider } from "@mui/material";

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
  const theme = useCustomTheme();
  const contacts = useSearchedContacts(searchFilter);
  const groups = useSearchedGroupsCollections(searchFilter);
  const nfts = useSearchedNfts(searchFilter);
  const tokens = useSearchedTokens(searchFilter);
  const allResultsLength =
    contacts.length + groups.length + nfts.length + tokens.length;
  const currentCounter = getCurrentCounter(arrowIndex, allResultsLength);

  if (!searchFilter) return <div />;

  return (
    <div
      style={{
        padding: 16,
      }}
    >
      <div>
        <SpotlightContacts
          selectedIndex={
            currentCounter < contacts.length ? currentCounter : null
          }
          contacts={contacts}
          setSelectedContact={setSelectedContact}
        />
      </div>
      {groups.length > 0 ? <>
        <Divider
          style={{
              backgroundColor: theme.custom.colors.nav,
              marginTop: 12,
              marginBottom: 12,
            }}
          />
        <div>
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
      </> : null}
      {nfts.length > 0 ? <>
        <Divider
          style={{
              backgroundColor: theme.custom.colors.nav,
              marginTop: 12,
              marginBottom: 12,
            }}
          />
        <div>
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
      </> : null}
      {tokens.length > 0 ? <>
        <Divider
          style={{
              backgroundColor: theme.custom.colors.nav,
              marginTop: 12,
              marginBottom: 12,
            }}
          />
        <div>
          <SpotlightTokens
            selectedIndex={
                currentCounter >=
                  contacts.length + groups.length + nfts.length &&
                currentCounter <
                  contacts.length + groups.length + nfts.length + tokens.length
                  ? currentCounter -
                    contacts.length -
                    groups.length -
                    nfts.length
                  : null
              }
            tokens={tokens}
            setOpen={setOpen}
            />
        </div>
      </> : null}
    </div>
  );
};

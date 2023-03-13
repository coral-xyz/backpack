import { useCustomTheme } from "@coral-xyz/themes";
import { Divider } from "@mui/material";

import { SpotlightContacts } from "./SpotlightContacts";
import { SpotlightGroups } from "./SpotlightGroups";
import { SpotlightNfts } from "./SpotlightNfts";
import { SpotlightTokens } from "./SpotlightTokens";
import { SpotlightXnfts } from "./SpotlightXnfts";
import { useSearchedContacts } from "./useSearchedContacts";
import { useSearchedGroupsCollections } from "./useSearchedGroups";
import { useSearchedNfts } from "./useSearchedNfts";
import { useSearchedTokens } from "./useSearchedTokens";
import { useSearchedXnfts } from "./useSearchedXnfts";
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
  const xnfts = useSearchedXnfts(searchFilter);
  const tokens = useSearchedTokens(searchFilter);
  const allResultsLength =
    contacts.length +
    groups.length +
    nfts.length +
    xnfts.length +
    tokens.length;
  const currentCounter = getCurrentCounter(arrowIndex, allResultsLength);

  if (!searchFilter) return <div />;

  const rows = [
    {
      component: (
        <div>
          <SpotlightContacts
            selectedIndex={
              currentCounter < contacts.length ? currentCounter : null
            }
            contacts={contacts}
            setSelectedContact={setSelectedContact}
          />
        </div>
      ),
      count: contacts.length,
      isFirst: contacts.length > 0,
    },
    {
      component: (
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
      ),
      count: groups.length,
      isFirst: contacts.length === 0 && groups.length > 0,
    },
    {
      component: (
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
      ),
      count: nfts.length,
      isFirst: contacts.length === 0 && groups.length === 0 && nfts.length > 0,
    },
    {
      component: (
        <div>
          <SpotlightXnfts
            selectedIndex={
              currentCounter >= contacts.length + groups.length + nfts.length &&
              currentCounter <
                contacts.length + groups.length + nfts.length + xnfts.length
                ? currentCounter - contacts.length - groups.length - nfts.length
                : null
            }
            xnfts={xnfts}
            setOpen={setOpen}
          />
        </div>
      ),
      count: xnfts.length,
      isFirst:
        contacts.length === 0 &&
        groups.length === 0 &&
        nfts.length === 0 &&
        xnfts.length > 0,
    },
    {
      component: (
        <div>
          <SpotlightTokens
            selectedIndex={
              currentCounter >=
                contacts.length + groups.length + nfts.length + xnfts.length &&
              currentCounter <
                contacts.length +
                  groups.length +
                  nfts.length +
                  xnfts.length +
                  tokens.length
                ? currentCounter -
                  contacts.length -
                  groups.length -
                  nfts.length -
                  xnfts.length
                : null
            }
            tokens={tokens}
            setOpen={setOpen}
          />
        </div>
      ),
      count: tokens.length,
      isFirst:
        contacts.length === 0 &&
        groups.length === 0 &&
        nfts.length === 0 &&
        xnfts.length === 0 &&
        tokens.length > 0,
    },
  ];

  return (
    <div
      style={{
        padding: 16,
      }}
    >
      {rows.map((row) => (
        <>
          {row.count > 0 && !row.isFirst ? (
            <Divider
              style={{
                backgroundColor: theme.custom.colors.nav,
                marginTop: 12,
                marginBottom: 12,
              }}
            />
          ) : null}
          {row.component}
        </>
      ))}
    </div>
  );
};

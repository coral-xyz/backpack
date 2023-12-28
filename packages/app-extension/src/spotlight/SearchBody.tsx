import { useSpotlightSearchedNfts } from "@coral-xyz/data-components";
import { useTheme } from "@coral-xyz/tamagui";
import { Divider } from "@mui/material";

import { SpotlightNfts } from "./SpotlightNfts";
import { SpotlightTokens } from "./SpotlightTokens";
import { SpotlightXnfts } from "./SpotlightXnfts";
import { useSearchedXnfts } from "./useSearchedXnfts";
import { getCurrentCounter } from "./utils";

export const SearchBody = ({
  searchFilter,
  arrowIndex,
  setOpen,
}: {
  searchFilter: string;
  arrowIndex: number;
  setOpen: any;
  setSelectedContact: any;
}) => {
  const theme = useTheme();
  const tokens = [] as any;
  const nfts = useSpotlightSearchedNfts(searchFilter);
  const xnfts = useSearchedXnfts(searchFilter);
  const allResultsLength = nfts.length + xnfts.length + tokens.length;
  const currentCounter = getCurrentCounter(arrowIndex, allResultsLength);

  if (!searchFilter) return <div />;

  const rows = [
    {
      component: (
        <div>
          <SpotlightNfts
            selectedIndex={currentCounter < nfts.length ? currentCounter : null}
            nfts={nfts}
            setOpen={setOpen}
          />
        </div>
      ),
      count: nfts.length,
      isFirst: nfts.length > 0,
    },
    {
      component: (
        <div>
          <SpotlightXnfts
            selectedIndex={
              currentCounter >= nfts.length &&
              currentCounter < nfts.length + xnfts.length
                ? currentCounter - nfts.length
                : null
            }
            xnfts={xnfts}
            setOpen={setOpen}
          />
        </div>
      ),
      count: xnfts.length,
      isFirst: nfts.length === 0 && xnfts.length > 0,
    },
    {
      component: (
        <div>
          <SpotlightTokens
            selectedIndex={
              currentCounter >= nfts.length + xnfts.length &&
              currentCounter < nfts.length + xnfts.length + tokens.length
                ? currentCounter - nfts.length - xnfts.length
                : null
            }
            tokens={tokens}
            setOpen={setOpen}
          />
        </div>
      ),
      count: tokens.length,
      isFirst: nfts.length === 0 && xnfts.length === 0 && tokens.length > 0,
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
                backgroundColor: theme.baseBackgroundL1.val,
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

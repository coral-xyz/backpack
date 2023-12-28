import { useEffect, useState } from "react";
import {
  Blockchain,
  NAV_COMPONENT_TOKEN,
  toTitleCase,
} from "@coral-xyz/common";
import { useSpotlightSearchedNfts } from "@coral-xyz/data-components";
import {
  showSpotlight,
  useActiveWallet,
  useBlockchainConnectionUrl,
  useBreakpoints,
  useNavigation,
  useOpenPlugin,
} from "@coral-xyz/recoil";
import { useTheme, YStack } from "@coral-xyz/tamagui";
import { Divider } from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useRecoilState } from "recoil";

import { Scrollbar } from "../components/common/Layout/Scrollbar";
import { Apps } from "../components/Unlocked/Apps";

import { SpotlightSearchBar } from "./SearchBar";
import { SearchBody } from "./SearchBody";
import { useSearchedTokens } from "./useSearchedTokens";
import { useSearchedXnfts } from "./useSearchedXnfts";
import { getCurrentCounter } from "./utils";

const style = {
  //  boxShadow: 24,
  marginLeft: "auto",
  marginRight: "auto",
};

export const Spotlight = () => {
  const [open, setOpen] = useRecoilState(showSpotlight);
  const [arrowIndex, setArrowIndex] = useState(0);

  useEffect(() => {
    function keyDownTextField(e: any) {
      if (e.key === "k" && e.metaKey) {
        setOpen((o) => !o);
        e.preventDefault();
      }
      if (e.which === 27 || e.keyCode === 27) {
        setOpen(false);
      }
      if (e.which === 38) {
        setArrowIndex((x) => x - 1);
      } else if (e.which === 40) {
        setArrowIndex((x) => x + 1);
      }
    }
    document.addEventListener("keydown", keyDownTextField);

    return () => {
      document.removeEventListener("keydown", keyDownTextField);
    };
  }, []);

  return (
    <Modal
      slotProps={{
        backdrop: {
          style: {
            backdropFilter: "blur(6px)",
          },
        },
      }}
      open={open}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <div
          style={{
            zIndex: 1,
            paddingLeft: "16px",
            paddingRight: "16px",
            paddingTop: "10px",
            paddingBottom: "10px",
            height: "56px",
            display: "flex",
          }}
          onClick={() => setOpen(false)}
        />
        <div style={{ flex: 1 }}>
          <Box
            sx={{ ...style }}
            style={{
              height: "100%",
            }}
            onClick={() => setOpen(false)}
          >
            <SpotlightInner setOpen={setOpen} arrowIndex={arrowIndex} />
          </Box>
        </div>
      </div>
    </Modal>
  );
};

function SpotlightInner({
  arrowIndex,
  setOpen,
}: {
  arrowIndex: number;
  setOpen: any;
}) {
  const [searchFilter, setSearchFilter] = useState("");
  const nfts = useSpotlightSearchedNfts(searchFilter);
  const xnfts = useSearchedXnfts(searchFilter);
  const tokens = useSearchedTokens(searchFilter);
  const allResultsLength = nfts.length + xnfts.length + tokens.length;
  const { push } = useNavigation();
  const activeWallet = useActiveWallet();
  const connectionUrl = useBlockchainConnectionUrl(activeWallet.blockchain);
  const theme = useTheme();
  const { isXs } = useBreakpoints();
  const openPlugin = useOpenPlugin();
  const isSearching = searchFilter.trim() !== "";

  return (
    <Scrollbar>
      <div>
        <div
          onKeyDown={(e) => {
            if (e.keyCode === 13) {
              const currentCounter = getCurrentCounter(
                arrowIndex,
                allResultsLength
              );

              const selectedTokenIndex =
                currentCounter >= nfts.length + xnfts.length &&
                currentCounter - nfts.length - xnfts.length < tokens.length
                  ? currentCounter - nfts.length - xnfts.length
                  : null;

              if (selectedTokenIndex || selectedTokenIndex === 0) {
                const token = tokens[selectedTokenIndex];
                push({
                  title: `${toTitleCase(Blockchain.SOLANA)} / ${token.name}`,
                  componentId: NAV_COMPONENT_TOKEN,
                  componentProps: {
                    blockchain: "solana",
                    tokenAddress: token.address,
                    publicKey: activeWallet.publicKey,
                  },
                });
                setOpen(false);
                return;
              }
            }
          }}
          style={{
            // @ts-ignore
            boxShadow: 24,
            height: searchFilter.trim() !== "" ? "100%" : undefined,
            background: theme.baseBackgroundL0.val,
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            width: isXs ? 343 : 500,
            marginLeft: "auto",
            marginRight: "auto",
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <SpotlightSearchBar
            searchFilter={searchFilter}
            setSearchFilter={setSearchFilter}
          />
        </div>
        {searchFilter.trim() !== "" ? (
          <SearchBody
            arrowIndex={arrowIndex}
            searchFilter={searchFilter}
            setOpen={setOpen}
            setSelectedContact={() => {}}
          />
        ) : null}
        {!isSearching ? <Apps /> : null}
      </div>
    </Scrollbar>
  );
}

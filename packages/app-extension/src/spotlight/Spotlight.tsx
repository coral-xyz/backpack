import { useEffect, useState } from "react";
import {
  Blockchain,
  NAV_COMPONENT_MESSAGE_CHAT,
  NAV_COMPONENT_MESSAGE_GROUP_CHAT,
  NAV_COMPONENT_NFT_DETAIL,
  NAV_COMPONENT_TOKEN,
  toTitleCase,
} from "@coral-xyz/common";
import {
  showSpotlight,
  useActiveWallet,
  useBlockchainConnectionUrl,
  useBreakpoints,
  useKeyringStoreState,
  useNavigation,
  useOpenPlugin,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Divider } from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useRecoilState } from "recoil";

import { Scrollbar } from "../components/common/Layout/Scrollbar";

import { SpotlightSearchBar } from "./SearchBar";
import { SearchBody } from "./SearchBody";
import { useSearchedContacts } from "./useSearchedContacts";
import { useSearchedGroupsCollections } from "./useSearchedGroups";
import { useSearchedNfts } from "./useSearchedNfts";
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
  const keyringState = useKeyringStoreState();
  const [arrowIndex, setArrowIndex] = useState(0);

  useEffect(() => {
    function keyDownTextField(e: any) {
      if (keyringState !== "unlocked") {
        return;
      }
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
  }, [keyringState]);

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
  const { push } = useNavigation();
  const activeWallet = useActiveWallet();
  const connectionUrl = useBlockchainConnectionUrl(activeWallet.blockchain);
  const theme = useCustomTheme();
  const { isXs } = useBreakpoints();
  const openPlugin = useOpenPlugin();

  const setSelectedContact = (contact: any) => {
    push({
      title: `@${contact?.username}`,
      componentId: NAV_COMPONENT_MESSAGE_CHAT,
      componentProps: {
        userId: contact?.uuid,
        id: contact?.uuid,
        username: contact?.username,
      },
    });
    setOpen(false);
  };

  return (
    <div
      onKeyDown={(e) => {
        if (e.keyCode === 13) {
          const currentCounter = getCurrentCounter(
            arrowIndex,
            allResultsLength
          );
          const selectedContactIndex =
            currentCounter < contacts.length ? currentCounter : null;
          const selectedGroupChatIndex =
            currentCounter >= contacts.length &&
            currentCounter - contacts.length < groups.length
              ? currentCounter - contacts.length
              : null;
          const selectedNFtChatIndex =
            currentCounter >= contacts.length + groups.length &&
            currentCounter - contacts.length - groups.length < nfts.length
              ? currentCounter - contacts.length - groups.length
              : null;
          const selectedXnftChatIndex =
            currentCounter >= contacts.length + groups.length + nfts.length &&
            currentCounter - contacts.length - groups.length - nfts.length <
              xnfts.length
              ? currentCounter - contacts.length - groups.length - nfts.length
              : null;
          const selectedTokenIndex =
            currentCounter >=
              contacts.length + groups.length + nfts.length + xnfts.length &&
            currentCounter -
              contacts.length -
              groups.length -
              nfts.length -
              xnfts.length <
              tokens.length
              ? currentCounter -
                contacts.length -
                groups.length -
                nfts.length -
                xnfts.length
              : null;

          if (selectedContactIndex || selectedContactIndex === 0) {
            const contact = contacts[selectedContactIndex];
            push({
              title: `@${contact?.username}`,
              componentId: NAV_COMPONENT_MESSAGE_CHAT,
              componentProps: {
                userId: contact?.uuid,
                id: contact?.uuid,
                username: contact?.username,
              },
            });
            setOpen(false);
            return;
          }
          if (selectedGroupChatIndex || selectedGroupChatIndex === 0) {
            const group = groups[selectedGroupChatIndex];
            push({
              title: group?.name,
              componentId: NAV_COMPONENT_MESSAGE_GROUP_CHAT,
              componentProps: {
                fromInbox: true,
                id: group.collectionId,
                title: group?.name,
              },
            });
            setOpen(false);
            return;
          }
          if (selectedNFtChatIndex || selectedNFtChatIndex === 0) {
            const nft = nfts[selectedNFtChatIndex];
            push({
              title: nft?.name,
              componentId: NAV_COMPONENT_NFT_DETAIL,
              componentProps: {
                nftId: nft.id,
                publicKey: activeWallet.publicKey,
                connectionUrl,
              },
            });
            setOpen(false);
            return;
          }
          if (selectedXnftChatIndex || selectedXnftChatIndex === 0) {
            const xnft = xnfts[selectedXnftChatIndex];
            setOpen(false);
            openPlugin(xnft.publicKey);
          }
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
        background: theme.custom.colors.backgroundBackdrop,
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
      {searchFilter.trim() !== "" ? (
        <>
          <Divider
            style={{
              backgroundColor: theme.custom.colors.nav,
            }}
          />
          <div style={{ flex: 1 }}>
            <Scrollbar>
              <SearchBody
                arrowIndex={arrowIndex}
                searchFilter={searchFilter}
                setOpen={setOpen}
                setSelectedContact={setSelectedContact}
              />
            </Scrollbar>
          </div>
        </>
      ) : null}
    </div>
  );
}

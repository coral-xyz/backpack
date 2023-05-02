import React, { useEffect, useState } from "react";
import { Barter, deriveAgreementAddress } from "@coral-xyz/barter-sdk";
import type { BarterOffers, BarterResponse } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { Loading } from "@coral-xyz/react-common";
import {
  useActiveSolanaWallet,
  useAnchorContext,
  useSolanaCtx,
} from "@coral-xyz/recoil";
import { SignalingManager } from "@coral-xyz/tamagui";
import { useCustomTheme } from "@coral-xyz/themes";
import { PublicKey } from "@solana/web3.js";

import { PLUGIN_HEIGHT_PERCENTAGE } from "../../utils/constants";
import { useChatContext } from "../ChatContext";
import { ScrollBarImpl } from "../ScrollbarImpl";

import { BarterProvider } from "./BarterContext";
import { BarterHeader } from "./BarterHeader";
import { SelectPage } from "./SelectPage";
import { SwapPage } from "./SwapPage";

export const BarterUi = ({ roomId }: { roomId: string }) => {
  const theme = useCustomTheme();
  const [selectNft, setSelectNft] = useState(false);
  const [barterState, setBarterState] = useState<BarterResponse | null>(null);
  const { openPlugin, setOpenPlugin, remoteUsername } = useChatContext();
  const [remotePrimaryPubkey, setRemotePrimaryPubkey] = useState(null);
  const { provider } = useAnchorContext();
  const barterClient = new Barter(provider);
  const activeSolWallet = useActiveSolanaWallet();
  const solanaContext = useSolanaCtx();

  async function init() {
    try {
      const data = await fetch(`${BACKEND_API_URL}/users/${remoteUsername}`);
      const json = await data.json();
      setRemotePrimaryPubkey(
        json.publicKeys.find((x) => x.blockchain === "solana")?.publicKey
      );
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    init();
  }, [remoteUsername]);

  const getActiveBarter = async (
    barterId: string,
    remotePrimaryPubkey: string | null
  ) => {
    if (!remotePrimaryPubkey) {
      return;
    }
    const agreement = deriveAgreementAddress(
      new PublicKey(activeSolWallet.publicKey),
      new PublicKey(remotePrimaryPubkey)
    )[0];
    let data;
    try {
      data = await barterClient.program.account.agreement.fetch(agreement);
      console.error(data);
    } catch (e) {
      console.error(e);
    }

    if (data) {
      const result = await solanaContext.connection.getMultipleAccountsInfo([
        ...data.offer.map((x) => x.mint),
        ...data.expecting.map((x) => x.mint),
      ]);

      // There is an active on chain barter
      setBarterState({
        state: "on_chain",
        localOffers: (data.initiater.toBase58() === activeSolWallet.publicKey
          ? data.offer
          : data.expecting
        ).map((x) => ({
          mint: x.item.mint.toString(),
          amount: x.item.amount.toNumber(),
          publicKey: "",
          type: "NFT",
        })),
        remoteOffers: (data.initiater.toBase58() !== activeSolWallet.publicKey
          ? data.offer
          : data.expecting
        ).map((x) => ({
          mint: x.item.mint.toString(),
          amount: x.item.amount.toNumber(),
          publicKey: "",
          type: "NFT",
        })),
        id: 0,
      });
      return;
    }
    try {
      const res = await fetch(
        barterId
          ? `${BACKEND_API_URL}/barter/?barterId=${barterId}`
          : `${BACKEND_API_URL}/barter/active?room=${roomId}&type=individual`,
        {
          method: "GET",
        }
      );
      const json = await res.json();
      setBarterState(json.barter);
      SignalingManager.getInstance().onBarterUpdate = (updatedParams: {
        barterId: number;
        localOffers?: BarterOffers;
        remoteOffers?: BarterOffers;
      }) => {
        if (updatedParams.barterId === json.barter.id) {
          setBarterState((s) => ({
            localOffers: updatedParams.localOffers || s?.localOffers || [],
            remoteOffers: updatedParams.remoteOffers || s?.remoteOffers || [],
            id: updatedParams.barterId,
            state: s?.state || "in_progress",
          }));
        }
      };
      SignalingManager.getInstance().onBarterExecute = (props: {
        barterId: number;
      }) => {
        if (props.barterId === json.barter.id) {
          setOpenPlugin({ type: "", metadata: {} });
        }
      };
    } catch (e) {
      console.error("could not get active barter");
    }
  };

  useEffect(() => {
    getActiveBarter(
      openPlugin.type === "barter" ? openPlugin.metadata?.barterId ?? "" : "",
      remotePrimaryPubkey
    );
  }, [openPlugin?.metadata, remotePrimaryPubkey]);

  return (
    <BarterProvider
      barterId={barterState?.id || 0}
      setSelectNft={setSelectNft}
      room={roomId}
    >
      <div>
        <ScrollBarImpl height={`${PLUGIN_HEIGHT_PERCENTAGE}vh`}>
          <div
            style={{
              height: "calc(100% - 56px)",
              background: theme.custom.colors.invertedTertiary,
              overflow: "scroll",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              {!barterState ? (
                <>
                  <BarterHeader />
                  <Loading />
                </>
              ) : null}
              {barterState ? (
                <>
                  {!selectNft ? (
                    <>
                      <BarterHeader />
                      <SwapPage
                        remotePrimaryPubkey={remotePrimaryPubkey}
                        localSelection={barterState?.localOffers || []}
                        remoteSelection={barterState?.remoteOffers || []}
                      />
                    </>
                  ) : null}
                  {selectNft ? (
                    <SelectPage
                      setBarterState={setBarterState}
                      currentSelection={barterState?.localOffers || []}
                    />
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        </ScrollBarImpl>
      </div>
    </BarterProvider>
  );
};

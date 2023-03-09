import React, { useEffect, useState } from "react";
import type { BarterOffers, BarterResponse } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { Loading, SignalingManager } from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";

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
  const { setOpenPlugin } = useChatContext();

  const getActiveBarter = async () => {
    try {
      const res = await fetch(
        `${BACKEND_API_URL}/barter/active?room=${roomId}&type=individual`,
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
    getActiveBarter();
  }, []);

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
              {!barterState ? <>
                <BarterHeader />
                <Loading />
              </> : null}
              {barterState ? <>
                {!selectNft ? <>
                  <BarterHeader />
                  <SwapPage
                    localSelection={barterState?.localOffers || []}
                    remoteSelection={barterState?.remoteOffers || []}
                      />
                </> : null}
                {selectNft ? <SelectPage
                  setBarterState={setBarterState}
                  currentSelection={barterState?.localOffers || []}
                    /> : null}
              </> : null}
            </div>
          </div>
        </ScrollBarImpl>
      </div>
    </BarterProvider>
  );
};

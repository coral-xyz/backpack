import React, { useEffect, useState } from "react";
import type { BarterOffers, BarterResponse} from "@coral-xyz/common";
import { BACKEND_API_URL,Blockchain  } from "@coral-xyz/common";
import { SignalingManager } from "@coral-xyz/react-common";
import { useTokenMetadata } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";

import { ScrollBarImpl } from "../ScrollbarImpl";

import { BarterProvider } from "./BarterContext";
import { SelectPage } from "./SelectPage";
import { SwapPage } from "./SwapPage";

export const BarterUi = ({ roomId }: { roomId: string }) => {
  const theme = useCustomTheme();
  const [selectNft, setSelectNft] = useState(false);
  const [barterState, setBarterState] = useState<BarterResponse | null>(null);

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
            ...s,
            localOffers: updatedParams.localOffers || s?.localOffers,
            remoteOffers: updatedParams.remoteOffers || s?.remoteOffers,
          }));
        }
      };
    } catch (e) {
      console.error("could not get active barter");
    }
  };

  useEffect(() => {
    getActiveBarter();
  }, []);

  if (!barterState) {
    return "loading...";
  }

  return (
    <BarterProvider setSelectNft={setSelectNft} room={roomId}>
      <div>
        <ScrollBarImpl height={"50vh"}>
          <div
            style={{
              height: "100%",
              background: theme.custom.colors.invertedTertiary,
            }}
          >
            {!selectNft && (
              <SwapPage
                localSelection={barterState?.localOffers || []}
                remoteSelection={barterState?.remoteOffers || []}
              />
            )}
            {selectNft && (
              <SelectPage
                setBarterState={setBarterState}
                currentSelection={barterState?.localOffers || []}
              />
            )}
          </div>
        </ScrollBarImpl>
      </div>
    </BarterProvider>
  );
};

import { useState } from "react";
import { blockchainBalancesSorted, useLoader } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";

import { ScrollBarImpl } from "../ScrollbarImpl";

import { BarterProvider } from "./BarterContext";
import { SelectPage } from "./SelectPage";
import { SwapPage } from "./SwapPage";

export const BarterUi = () => {
  const theme = useCustomTheme();
  const [selectNft, setSelectNft] = useState(false);

  return (
    <BarterProvider setSelectNft={setSelectNft}>
      <div>
        <ScrollBarImpl height={"50vh"}>
          <div
            style={{
              height: "100%",
              background: theme.custom.colors.invertedTertiary,
            }}
          >
            {!selectNft && <SwapPage />}
            {selectNft && (
              <SelectPage
                currentSelection={[]}
                remoteSelection={[
                  // {
                  //   mint: "FGkdkaHiAR4cuVJDUgMKS7ypZaGSwUCcMCDGVtZTU51z",
                  //   amount: 1,
                  //   publicKey: "4m39tDyZcK9dgqYaBaX7PiTp1kjAKrMhNYmxDcVu3hNp",
                  // },
                ]}
              />
            )}
          </div>
        </ScrollBarImpl>
      </div>
    </BarterProvider>
  );
};

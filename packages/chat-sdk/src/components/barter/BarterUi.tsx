import { useState } from "react";
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
            {selectNft && <SelectPage currentSelection={[]} />}
          </div>
        </ScrollBarImpl>
      </div>
    </BarterProvider>
  );
};

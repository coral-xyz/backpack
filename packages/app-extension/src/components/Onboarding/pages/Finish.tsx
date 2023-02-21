import { BrowserRuntimeExtension, XNFT_GG_LINK } from "@coral-xyz/common";

import { SetupComplete } from "../../common/Account/SetupComplete";

export const Finish = () => {
  return (
    <SetupComplete
      onClose={() => {
        BrowserRuntimeExtension.closeActiveTab();
        window.open(XNFT_GG_LINK, "_blank");
      }}
    />
  );
};

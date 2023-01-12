import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { CloseButton } from "react-toastify/dist/components";
import { useCustomTheme } from "@coral-xyz/themes";
import { ArrowBack } from "@mui/icons-material";
import { style } from "@mui/system";

import { WithDrawer } from "../../../common/Layout/Drawer";
import { NavBackButton } from "../../../common/Layout/Nav";
import {
  NavStackEphemeral,
  NavStackScreen,
} from "../../../common/Layout/NavStack";

export function TransactionDetail({
  transaction,
  setTransactionDetail,
}: {
  transaction: any;
  setTransactionDetail: Dispatch<SetStateAction<null>>;
}) {
  const theme = useCustomTheme();
  const [openDrawer, setOpenDrawer] = useState(true);

  console.log(transaction, "transaction from detail");

  return (
    <WithDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
      <div style={{ height: "100%" }}>
        <NavStackEphemeral
          initialRoute={{ name: "transactionDetails" }}
          options={() => ({ title: "transaction type" })}
          navButtonLeft={
            <NavBackButton
              onClick={() => {
                setTransactionDetail(null);
                setOpenDrawer(false);
              }}
            />
          }
        >
          <NavStackScreen
            name={"transactionDetails"}
            component={(props: any) => <div {...props}> heloo </div>}
          ></NavStackScreen>
        </NavStackEphemeral>
      </div>
    </WithDrawer>
  );
}

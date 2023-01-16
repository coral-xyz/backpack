import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { CloseButton } from "react-toastify/dist/components";
import { useCustomTheme } from "@coral-xyz/themes";
import { ArrowBack } from "@mui/icons-material";
import { Card } from "@mui/material";
import { style } from "@mui/system";

import { WithDrawer } from "../../../common/Layout/Drawer";
import { NavBackButton } from "../../../common/Layout/Nav";
import {
  NavStackEphemeral,
  NavStackScreen,
} from "../../../common/Layout/NavStack";

import { getTransactionTitle } from "./detail-parser";

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
          options={() => ({ title: getTransactionTitle(transaction) })}
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
            component={(props: any) => (
              <Card {...props}>
                {transaction?.metaData?.offChainData?.image && (
                  <img
                    style={{
                      borderRadius: "4px",
                      width: "88px",
                      height: "88px",
                    }}
                    src={transaction?.metaData?.offChainData?.image}
                  />
                )}
              </Card>
            )}
          />
        </NavStackEphemeral>
      </div>
    </WithDrawer>
  );
}

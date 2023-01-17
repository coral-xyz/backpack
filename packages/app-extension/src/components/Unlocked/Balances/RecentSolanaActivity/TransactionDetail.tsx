import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { CloseButton } from "react-toastify/dist/components";
import { PrimaryButton } from "@coral-xyz/react-common";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { ArrowBack, CallMade } from "@mui/icons-material";
import { Button, Card, List, ListItem } from "@mui/material";
import { style } from "@mui/system";

import { WithDrawer } from "../../../common/Layout/Drawer";
import { NavBackButton } from "../../../common/Layout/Nav";
import {
  NavStackEphemeral,
  NavStackScreen,
} from "../../../common/Layout/NavStack";

import {
  formatTimestamp,
  getTransactionTitle,
  getTruncatedAddress,
} from "./detail-parser";

const useStyles = styles((theme) => ({
  transactionCard: {
    display: "flex",
    padding: "16px",
    flexDirection: "column",
    height: "100%",
    alignItems: "center",
    backgroundColor: theme.custom.colors.background,
  },
  nft: {
    borderRadius: "2px",
    width: "168px",
    height: "168px",
  },
  ctaButton: {
    margin: "16px",
    width: "100%",
    color: theme.custom.colors.fontColor,
    backgrounColor: theme.custom.colors.secondaryButton,
  },
  detailList: {
    marginTop: "16px",
    paddingTop: 0,
    paddingBottom: 0,
    marginLeft: "16px",
    marginRight: "16px",
    borderRadius: "14px",
    width: "100%",
    fontSize: "14px",
    border: `${theme.custom.colors.borderFull}`,
  },
  firstRow: {
    paddingLeft: "12px",
    paddingRight: "12px",
    paddingTop: "10px",
    paddingBottom: "10px",
    display: "flex",
    borderBottom: `solid 1pt ${theme.custom.colors.border}`,
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
    backgroundColor: theme.custom.colors.nav,
  },
  middleRow: {
    paddingLeft: "12px",
    paddingRight: "12px",
    paddingTop: "10px",
    paddingBottom: "10px",
    display: "flex",
    borderBottom: `solid 1pt ${theme.custom.colors.border}`,
    backgroundColor: theme.custom.colors.nav,
  },
  lastRow: {
    paddingLeft: "12px",
    paddingRight: "12px",
    paddingTop: "10px",
    paddingBottom: "10px",
    display: "flex",
    borderBottomLeftRadius: "12px",
    borderBottomRightRadius: "12px",
    backgroundColor: theme.custom.colors.nav,
  },
  cell: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
  },
  cellValue: {
    display: "flex",
    alignItems: "center",
    fontWeight: 500,
    color: theme.custom.colors.fontColor,
  },
  confirmedStatus: {
    color: "#35A63A",
  },
  label: { color: theme.custom.colors.secondary },
}));

export function TransactionDetail({
  transaction,
  setTransactionDetail,
}: {
  transaction: any;
  setTransactionDetail: Dispatch<SetStateAction<null>>;
}) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const [openDrawer, setOpenDrawer] = useState(true);

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
              <Card {...props} className={classes.transactionCard}>
                {transaction?.metaData?.offChainData?.image && (
                  <>
                    <img
                      className={classes.nft}
                      src={transaction?.metaData?.offChainData?.image}
                    />
                    <div
                      style={{
                        fontSize: "24px",
                        color: theme.custom.colors.fontColor,
                        paddingTop: "16px",
                      }}
                    >
                      {getTransactionTitle(transaction)}
                    </div>
                  </>
                )}

                <PrimaryButton
                  className={classes.ctaButton}
                  label="View on Solscan"
                >
                  Call to Action
                </PrimaryButton>
                <List className={classes.detailList}>
                  <div className={classes.firstRow}>
                    <div className={classes.cell}>
                      <div className={classes.label}>Date</div>

                      <div className={classes.cellValue}>
                        {formatTimestamp(
                          new Date(transaction?.timestamp * 1000)
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={classes.middleRow}>
                    <div className={classes.cell}>
                      <div className={classes.label}>Network Fee</div>

                      <div className={classes.cellValue}>
                        {transaction?.fee / 10 ** 9} SOL
                      </div>
                    </div>
                  </div>
                  <div className={classes.middleRow}>
                    <div className={classes.cell}>
                      <div className={classes.label}>Status</div>

                      {/* all transactions from helius are confirmed */}
                      <div className={classes.confirmedStatus}>Confirmed</div>
                    </div>
                  </div>
                  <div className={classes.lastRow}>
                    <div className={classes.cell}>
                      <div className={classes.label}>Signature</div>

                      <div className={classes.cellValue}>
                        {getTruncatedAddress(transaction?.signature)}
                        <CallMade
                          style={{
                            color: theme.custom.colors.icon,
                            paddingLeft: "2px",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </List>
              </Card>
            )}
          />
        </NavStackEphemeral>
      </div>
    </WithDrawer>
  );
}

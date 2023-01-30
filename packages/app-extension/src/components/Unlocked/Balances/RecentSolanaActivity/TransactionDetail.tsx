import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Blockchain, explorerUrl } from "@coral-xyz/common";
import { PrimaryButton } from "@coral-xyz/react-common";
import {
  useActiveWallet,
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
  useSplTokenRegistry,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { ArrowRightAltRounded, CallMade } from "@mui/icons-material";
import { Card, List } from "@mui/material";
import type { TokenInfo } from "@solana/spl-token-registry";
import { TransactionType } from "helius-sdk/dist/types";

import { WithDrawer } from "../../../common/Layout/Drawer";
import { NavBackButton } from "../../../common/Layout/Nav";
import {
  NavStackEphemeral,
  NavStackScreen,
} from "../../../common/Layout/NavStack";

import {
  formatTimestamp,
  getTransactionCaption,
  getTransactionTitle,
  getTruncatedAddress,
  isNFTTransaction,
  isUserTxnSender,
} from "./detail-parser";
import type { HeliusParsedTransaction } from "./types";

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
    "&:hover": {
      cursor: "pointer",
    },
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
  failedStatus: {
    color: "#E95050",
  },
  label: { color: theme.custom.colors.secondary },
}));

export function TransactionDetail({
  transaction,
  setTransactionDetail,
}: {
  transaction: HeliusParsedTransaction;
  setTransactionDetail: Dispatch<SetStateAction<null>>;
}) {
  const classes = useStyles();
  const activeWallet = useActiveWallet();
  const theme = useCustomTheme();
  const navigate = useNavigate();
  const explorer = useBlockchainExplorer(Blockchain.SOLANA);
  const connectionUrl = useBlockchainConnectionUrl(Blockchain.SOLANA);
  const [openDrawer, setOpenDrawer] = useState(true);
  const tokenRegistry = useSplTokenRegistry();
  let tokenData: (TokenInfo | undefined)[] = [];

  // TODO - this is duplicated in ListItem.tsx, better to pass in setTransactionDetail state
  // add appropriate metadata
  if (transaction?.tokenTransfers?.length > 0)
    transaction?.tokenTransfers?.map((transfer: any) => {
      if (transfer?.mint && tokenRegistry.get(transfer?.mint)) {
        tokenData.push(tokenRegistry.get(transfer?.mint));
      }
    });

  return (
    <WithDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
      <div style={{ height: "100%" }}>
        <NavStackEphemeral
          initialRoute={{ name: "transactionDetails" }}
          options={() => {
            if (isNFTTransaction(transaction)) {
              return { title: getTransactionCaption(transaction, tokenData) };
            }

            return { title: getTransactionTitle(transaction) };
          }}
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
                {transaction?.metadata?.onChaindata?.data?.uri ||
                  (transaction?.metadata?.offChainData?.image && (
                    <>
                      <img
                        className={classes.nft}
                        src={
                          transaction?.metadata?.onChaindata?.data?.uri ||
                          transaction?.metadata?.offChainData?.image
                        }
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
                  ))}

                {transaction?.type === TransactionType.SWAP && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: "40px",
                      marginBottom: "40px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "column",
                      }}
                    >
                      <img
                        style={{
                          borderRadius: "50%",
                          width: "56px",
                          height: "56px",
                        }}
                        src={tokenData[0] && tokenData[0]?.logoURI}
                      />

                      <div
                        style={{
                          fontSize: "16px",
                          lineHeight: "24px",
                          color: "white",
                          marginTop: "5px",
                        }}
                      >
                        {new Number(
                          transaction?.description?.split(" ")[2]
                        ).toFixed(2) +
                          " " +
                          tokenData[0]?.symbol ||
                          getTruncatedAddress(
                            transaction?.tokenTransfers?.[0]?.mint
                          )}
                      </div>
                    </div>

                    <ArrowRightAltRounded
                      style={{
                        color: theme.custom.colors.alpha,
                        width: "80px",
                        fontSize: "35px",
                      }}
                    />

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "column",
                      }}
                    >
                      <img
                        style={{
                          borderRadius: "50%",
                          width: "56px",
                          height: "56px",
                        }}
                        src={tokenData[1] && tokenData[1]?.logoURI}
                      />
                      <div
                        style={{
                          fontSize: "16px",
                          lineHeight: "24px",
                          color: "white",
                          marginTop: "5px",
                        }}
                      >
                        {new Number(
                          transaction?.description?.split(" ")[5]
                        ).toFixed(2) +
                          " " +
                          tokenData[1]?.symbol ||
                          getTruncatedAddress(
                            transaction?.tokenTransfers?.[0]?.mint
                          )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TODO - Default to check/error */}

                {/* TODO - add other functionality for this CTA button */}
                {transaction?.type === TransactionType.NFT_SALE &&
                  transaction.feePayer === activeWallet.publicKey && (
                    <PrimaryButton
                      className={classes.ctaButton}
                      label="View in your gallery"
                      onClick={() => {
                        navigate("/nfts");
                      }}
                    />
                  )}

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

                  {(transaction?.type === TransactionType.UNKNOWN ||
                    transaction.type === TransactionType.TRANSFER) &&
                    isUserTxnSender(transaction) &&
                    transaction?.tokenTransfers?.[0]?.toUserAccount && (
                      <div className={classes.middleRow}>
                        <div className={classes.cell}>
                          <div className={classes.label}>To</div>

                          <div className={classes.cellValue}>
                            {getTruncatedAddress(
                              transaction?.tokenTransfers?.[0]?.toUserAccount
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  {(transaction?.type === TransactionType.UNKNOWN ||
                    transaction.type === TransactionType.TRANSFER) &&
                    isUserTxnSender(transaction) === false &&
                    transaction?.tokenTransfers?.[0]?.fromUserAccount && (
                      <div className={classes.middleRow}>
                        <div className={classes.cell}>
                          <div className={classes.label}>From</div>

                          <div className={classes.cellValue}>
                            {getTruncatedAddress(
                              transaction?.tokenTransfers?.[0]?.fromUserAccount
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  {transaction?.type === TransactionType.SWAP && (
                    <>
                      <div className={classes.middleRow}>
                        <div className={classes.cell}>
                          <div className={classes.label}>You paid</div>

                          <div className={classes.cellValue}>
                            {new Number(
                              transaction?.description?.split(" ")[2]
                            ).toFixed(2) +
                              " " +
                              tokenData[0]?.symbol ||
                              getTruncatedAddress(
                                transaction?.tokenTransfers?.[0]?.mint
                              )}
                          </div>
                        </div>
                      </div>
                      <div className={classes.middleRow}>
                        <div className={classes.cell}>
                          <div className={classes.label}>You Received</div>

                          <div className={classes.confirmedStatus}>
                            {new Number(
                              transaction?.description?.split(" ")[5]
                            ).toFixed(2) +
                              " " +
                              tokenData[1]?.symbol ||
                              getTruncatedAddress(
                                transaction?.tokenTransfers?.[0]?.mint
                              )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

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

                      {transaction?.transactionError ? (
                        <div className={classes.failedStatus}>Failed</div>
                      ) : (
                        <div className={classes.confirmedStatus}>Confirmed</div>
                      )}
                    </div>
                  </div>
                  <div
                    className={classes.lastRow}
                    onClick={() => {
                      window.open(
                        explorerUrl(
                          explorer!,
                          transaction.signature,
                          connectionUrl!
                        )
                      );
                    }}
                  >
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

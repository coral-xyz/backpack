import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Blockchain,
  exploreAddressUrl,
  explorerUrl,
  walletAddressDisplay,
} from "@coral-xyz/common";
import { PrimaryButton } from "@coral-xyz/react-common";
import {
  SOL_LOGO_URI,
  useActiveWallet,
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
  useJupiterTokenMap,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import {
  ArrowDownwardRounded,
  ArrowRightAltRounded,
  CallMade,
  CancelTwoTone,
  CheckCircleTwoTone,
  Image,
  SendRounded,
  WhatshotRounded,
} from "@mui/icons-material";
import { Card, List } from "@mui/material";
import type { TokenInfo } from "@solana/spl-token-registry";
import { Source, TransactionType } from "helius-sdk/dist/types";

import { UNKNOWN_ICON_SRC } from "../../../common/Icon";
import { WithDrawer } from "../../../common/Layout/Drawer";
import { NavBackButton } from "../../../common/Layout/Nav";
import {
  NavStackEphemeral,
  NavStackScreen,
} from "../../../common/Layout/NavStack";

import {
  formatTimestamp,
  getTokenData,
  getTransactionDetailTitle,
  getTransactionTitle,
  isNFTTransaction,
  isUserTxnSender,
} from "./detail-parser";
import type { HeliusParsedTransaction } from "./types";

const useStyles = styles((theme) => ({
  transactionCard: {
    display: "flex",
    padding: "16px",
    paddingTop: "24px",
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
  transferAmount: {
    fontSize: "30px",
    color: theme.custom.colors.fontColor,
    fontWeight: 600,
    marginTop: "8px",
  },
  tokenLogo: {
    borderRadius: "50%",
    width: "56px",
    height: "56px",
  },
  addressExplorerRow: {
    "&:hover": {
      cursor: "pointer",
    },
  },
}));

export function TransactionDetail({
  metadata,
  transaction,
  setMetadata,
  setTransactionDetail,
}: {
  metadata: any;
  transaction: HeliusParsedTransaction;
  setMetadata: Dispatch<SetStateAction<any>>;
  setTransactionDetail: Dispatch<SetStateAction<any>>;
}) {
  const theme = useCustomTheme();
  const classes = useStyles();
  const registry = useJupiterTokenMap();
  const activeWallet = useActiveWallet();
  const navigate = useNavigate();
  const [openDrawer, setOpenDrawer] = useState(true);

  // TODO - this is duplicated in ListItem.tsx, better to pass in setTransactionDetail state
  const tokenData = getTokenData(registry, transaction);

  return (
    <WithDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
      <div
        style={{ height: "100%", background: theme.custom.colors.background }}
      >
        <NavStackEphemeral
          initialRoute={{ name: "transactionDetails" }}
          options={() => {
            return {
              title: getTransactionDetailTitle(
                activeWallet,
                transaction,
                activeWallet?.publicKey
              ),
            };
          }}
          navButtonLeft={
            <NavBackButton
              onClick={() => {
                setTransactionDetail(null);
                setMetadata(null);
                setOpenDrawer(false);
              }}
            />
          }
        >
          <NavStackScreen
            name="transactionDetails"
            component={(props: any) => (
              <Card {...props} className={classes.transactionCard}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingBottom: "10px",
                  }}
                >
                  <DetailCardHeader
                    transaction={transaction}
                    tokenData={tokenData}
                    metadata={metadata}
                  />
                </div>

                {/* TODO - Default to check/error */}

                {/* TODO - add other functionality for this CTA button. Will need to
                create mappings for 'verified' sites to determine correct URL*/}
                {transaction?.type === TransactionType.NFT_SALE &&
                  transaction?.events?.nft?.buyer ===
                    activeWallet.publicKey ? <PrimaryButton
                      className={classes.ctaButton}
                      label="View in your gallery"
                      onClick={() => {
                        navigate("/nfts");
                      }}
                    /> : null}

                <DetailTable transaction={transaction} tokenData={tokenData} />
              </Card>
            )}
          />
        </NavStackEphemeral>
      </div>
    </WithDrawer>
  );
}

// similar to RecentActivityListItemIcon in ListItem.tsx. Controls graphic displayed in
// top-half of detail card. May be best to further abstract to icon Object map (like in RecentSolanaActivity/Icons.tsx)
function DetailCardHeader({
  transaction,
  tokenData,
  metadata,
}: {
  transaction: HeliusParsedTransaction;
  tokenData: (TokenInfo | undefined)[];
  metadata?: any;
}) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const activeWallet = useActiveWallet();
  if (transaction?.transactionError)
    return (
      <CancelTwoTone sx={{ height: 100, width: 100 }} htmlColor="#F13236" />
    );

  if (transaction.type === TransactionType.SWAP) {
    return (
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
            className={classes.tokenLogo}
            src={(tokenData[0] && tokenData[0]?.logoURI) || UNKNOWN_ICON_SRC}
          />

          <div
            style={{
              fontSize: "16px",
              lineHeight: "24px",
              color: theme.custom.colors.fontColor,
              marginTop: "5px",
              textAlign: "center",
            }}
          >
            {transaction?.tokenTransfers[0]?.tokenAmount.toFixed(5) +
              " " +
              (tokenData[0]?.symbol ||
                walletAddressDisplay(transaction?.tokenTransfers?.[0]?.mint))}
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
            className={classes.tokenLogo}
            src={(tokenData[1] && tokenData[1]?.logoURI) || UNKNOWN_ICON_SRC}
          />
          <div
            style={{
              fontSize: "16px",
              lineHeight: "24px",
              color: theme.custom.colors.fontColor,
              marginTop: "5px",
              textAlign: "center",
            }}
          >
            {transaction?.tokenTransfers[1]?.tokenAmount.toFixed(5) +
              " " +
              (tokenData[1]?.symbol ||
                walletAddressDisplay(transaction?.tokenTransfers?.[0]?.mint))}
          </div>
        </div>
      </div>
    );
  }

  // if NFT url available, display it. Check on-chain data first
  const nftImage = undefined; // FIXME: metadata?.onChainMetadata?.metadata?.data?.uri;

  const nftPrice = transaction?.events?.nft?.amount
    ? transaction?.events?.nft?.amount / 10 ** 9
    : null;

  if (isNFTTransaction(transaction) && nftImage) {
    return (
      <>
        <img className={classes.nft} src={nftImage} />
        <div
          style={{
            fontSize: "24px",
            color: theme.custom.colors.fontColor,
            paddingTop: "16px",
          }}
        >
          {getTransactionTitle(activeWallet, transaction)}
        </div>
        {nftPrice ? <div style={{ display: "flex", alignItems: "center" }}>
          <img
            style={{
                borderRadius: "50%",
                width: "16px",
                height: "16px",
                marginRight: "5px",
              }}
            src={SOL_LOGO_URI}
            />
          <div
            style={{
                fontSize: "16px",
                color: theme.custom.colors.fontColor,
              }}
            >
            {nftPrice + " SOL"}
          </div>
        </div> : null}
      </>
    );
  }

  if (transaction.type === TransactionType.TRANSFER) {
    //SOL transfer
    if (transaction.source === Source.SYSTEM_PROGRAM) {
      return (
        <>
          <img className={classes.tokenLogo} src={SOL_LOGO_URI} />
          <div className={classes.transferAmount}>
            {isUserTxnSender(transaction, activeWallet)
              ? "- " +
                transaction?.nativeTransfers?.[0]?.amount / 10 ** 9 +
                " SOL"
              : "+ " +
                transaction?.nativeTransfers?.[0]?.amount / 10 ** 9 +
                " SOL"}
          </div>
        </>
      );
    }
    // other SPL token Transfer. Check tokenRegistry first, then Helius metadata
    const transferIcon = tokenData[0]?.logoURI || UNKNOWN_ICON_SRC; // FIXME: || metadata?.onChainMetadata?.metadata?.data?.uri;

    const transferSymbol =
      tokenData[0]?.symbol || metadata?.onChainMetadata?.metadata?.data?.symbol;

    if (transferIcon) {
      return (
        <>
          <img className={classes.tokenLogo} src={transferIcon} />
          <div className={classes.transferAmount}>
            {isUserTxnSender(transaction, activeWallet)
              ? "- " +
                transaction?.tokenTransfers?.[0]?.tokenAmount +
                " " +
                (transferSymbol && transferSymbol)
              : "+ " +
                transaction?.tokenTransfers?.[0]?.tokenAmount +
                " " +
                (transferSymbol && transferSymbol)}
          </div>
        </>
      );
    }

    // if it is an NFT transfer and no NFT image was found above, show default Icon
    if (transaction?.tokenTransfers?.[0]?.tokenStandard === "NonFungible") {
      return (
        <Image
          style={{
            borderRadius: "2px",
            width: "168px",
            height: "168px",
            fill: "#99A4B4",
          }}
        />
      );
    }
    // default
    if (isUserTxnSender(transaction, activeWallet))
      return (
        <SendRounded
          style={{
            color: "#8F929E",
            width: "56px",
            height: "56px",
          }}
        />
      );
    return (
      <ArrowDownwardRounded
        style={{
          color: "#8F929E",
          width: "56px",
          height: "56px",
        }}
      />
    );
  }

  if (
    transaction?.type === TransactionType.BURN ||
    transaction?.type === TransactionType.BURN
  )
    return (
      <WhatshotRounded
        style={{
          color: "#E95050",
          width: "56px",
          height: "56px",
        }}
      />
    );

  return (
    <CheckCircleTwoTone sx={{ height: 100, width: 100 }} htmlColor="#35A63A" />
  );
}

function DetailTable({
  transaction,
  tokenData,
}: {
  transaction: HeliusParsedTransaction;
  tokenData: (TokenInfo | undefined)[];
}) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const explorer = useBlockchainExplorer(Blockchain.SOLANA);
  const connectionUrl = useBlockchainConnectionUrl(Blockchain.SOLANA);
  const activeWallet = useActiveWallet();

  return (
    <List className={classes.detailList}>
      <div className={classes.firstRow}>
        <div className={classes.cell}>
          <div className={classes.label}>Date</div>

          <div className={classes.cellValue}>
            {formatTimestamp(transaction?.timestamp)}
          </div>
        </div>
      </div>

      {(transaction?.type === TransactionType.UNKNOWN ||
        transaction.type === TransactionType.TRANSFER) &&
        isUserTxnSender(transaction, activeWallet) ? <div className={classes.addressExplorerRow}>
          <div
            className={classes.middleRow}
            onClick={() => {
                window.open(
                  exploreAddressUrl(
                    explorer!,
                    transaction?.tokenTransfers?.[0]?.toUserAccount ||
                      transaction?.nativeTransfers?.[0]?.toUserAccount,
                    connectionUrl!
                  )
                );
              }}
            >
            <div className={classes.cell}>
              <div className={classes.label}>To</div>
              <div className={classes.cellValue}>
                {walletAddressDisplay(
                    transaction?.tokenTransfers?.[0]?.toUserAccount ||
                      transaction?.nativeTransfers?.[0]?.toUserAccount
                  )}
                <CallMade
                  style={{
                      color: theme.custom.colors.icon,
                      paddingLeft: "2px",
                    }}
                  />
              </div>
            </div>
          </div>
        </div> : null}
      {(transaction?.type === TransactionType.UNKNOWN ||
        transaction.type === TransactionType.TRANSFER) &&
        isUserTxnSender(transaction, activeWallet) === false ? <div className={classes.middleRow}>
          <div className={classes.cell}>
            <div className={classes.label}>From</div>

            <div className={classes.cellValue}>
              {walletAddressDisplay(
                  transaction?.tokenTransfers?.[0]?.fromUserAccount ||
                    transaction?.nativeTransfers?.[0]?.fromUserAccount
                )}
            </div>
          </div>
        </div> : null}

      {transaction?.type === TransactionType.SWAP ? <>
        <div className={classes.middleRow}>
          <div className={classes.cell}>
            <div className={classes.label}>You paid</div>

            <div className={classes.cellValue}>
              {transaction?.tokenTransfers[0]?.tokenAmount.toFixed(5) +
                  " " +
                  (tokenData[0]?.symbol ||
                    walletAddressDisplay(
                      transaction?.tokenTransfers?.[0]?.mint
                    ))}
            </div>
          </div>
        </div>
        <div className={classes.middleRow}>
          <div className={classes.cell}>
            <div className={classes.label}>You Received</div>

            <div className={classes.confirmedStatus}>
              {transaction?.tokenTransfers[1]?.tokenAmount.toFixed(5) +
                  " " +
                  (tokenData[1]?.symbol ||
                    walletAddressDisplay(
                      transaction?.tokenTransfers?.[0]?.mint
                    ))}
            </div>
          </div>
        </div>
      </> : null}
      {/* ALL txn types have  first row (Date) rest of data
      rows below (Network Fee, Status, Signature)*/}
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
            explorerUrl(explorer!, transaction.signature, connectionUrl!)
          );
        }}
      >
        <div className={classes.cell}>
          <div className={classes.label}>Signature</div>

          <div className={classes.cellValue}>
            {walletAddressDisplay(transaction?.signature)}
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
  );
}

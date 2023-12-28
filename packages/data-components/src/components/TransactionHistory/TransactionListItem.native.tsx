import { memo, useCallback } from "react";
import { type Blockchain, formatWalletAddress } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  getBlockchainLogo,
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
} from "@coral-xyz/recoil";
import { explorerUrl } from "@coral-xyz/secure-background/legacyCommon";
import {
  ArrowUpRightIcon,
  ListItemCore,
  ListItemIconCore,
  styled,
  StyledText,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";

import type { ProviderId } from "../../apollo/graphql";

import { useTransactionsContext } from "./context";
import { parseTransaction, type ParseTransactionDetails } from "./parsing";
import {
  TransactionListItemIconDefault,
  TransactionListItemIconError,
} from "./TransactionListItemIcon";
import type { ResponseTransaction } from "./utils";

export type TransactionListItemProps = {
  blockchain: ProviderId;
  transaction: ResponseTransaction;
};

export function TransactionListItem({
  blockchain,
  transaction,
}: TransactionListItemProps): JSX.Element {
  const { t } = useTranslation();
  const { onItemClick } = useTransactionsContext();
  const connection = useBlockchainConnectionUrl(
    blockchain.toLowerCase() as Blockchain
  );

  const explorer = useBlockchainExplorer(
    blockchain.toLowerCase() as Blockchain
  );

  /**
   * The parsed transaction type and description to provide the list item
   * display details and the list item icon component.
   */
  const details = parseTransaction(transaction, t);

  /**
   * Memoized click handler to pass in the transaction object explorer URL
   * to the remote prop function declaration.
   */
  const handleClick = useCallback(
    () =>
      onItemClick
        ? onItemClick(
            transaction,
            explorerUrl(explorer, transaction.hash ?? "", connection),
            details
          )
        : {},
    [connection, details, explorer, onItemClick, transaction]
  );

  const icon = transaction.error ? (
    <TransactionListItemIconError size={30} containerSize={44} />
  ) : (
    details?.card.icon ?? (
      <TransactionListItemIconDefault size={30} containerSize={44} />
    )
  );

  return (
    <ListItemCore
      style={{
        cursor: "pointer",
        hoverTheme: true,
        backgroundColor: "transparent",
      }}
      icon={icon}
      onClick={handleClick}
    >
      {details ? (
        <_TransactionListItemEnriched details={details} />
      ) : (
        <_TransactionListItemBasic
          blockchain={blockchain}
          hash={transaction.hash}
        />
      )}
    </ListItemCore>
  );
}

function _TransactionListItemEnriched({
  details,
}: {
  details: ParseTransactionDetails;
}): JSX.Element {
  return (
    <ListItemRow>
      <ListItemSide side="left">
        <TopLeftText>{details.card.tl}</TopLeftText>
        <ListItemStyledText fontSize="$sm" color="$baseTextMedEmphasis">
          {details.card.bl}
        </ListItemStyledText>
      </ListItemSide>
      <ListItemSide side="right">
        <_TopRight tr={details.card.tr} />
        <_BottomRight br={details.card.br} />
      </ListItemSide>
    </ListItemRow>
  );
}

const _TopRight = memo(function _TopRight({
  tr,
}: {
  tr: ParseTransactionDetails["card"]["tr"];
}) {
  if (!tr) {
    return null;
  }

  const trColor = tr.startsWith("+")
    ? "$greenText"
    : tr.startsWith("-")
    ? "$redText"
    : "$baseTextMedEmphasis";

  return (
    <ListItemStyledText fontSize="$sm" color={trColor}>
      {tr}
    </ListItemStyledText>
  );
});

const _BottomRight = memo(function _BottomRight({
  br,
}: {
  br: ParseTransactionDetails["card"]["br"];
}) {
  if (!br) {
    return null;
  }

  const brColor = br.startsWith("+")
    ? "$greenText"
    : br.startsWith("-")
    ? "$redText"
    : "$baseTextMedEmphasis";

  return (
    <ListItemStyledText fontSize="$sm" color={brColor}>
      {br}
    </ListItemStyledText>
  );
});

export function _TransactionListItemBasic({
  blockchain,
  hash,
}: {
  blockchain: ProviderId;
  hash: string;
}) {
  return (
    <ListItemRow>
      <ListItemSide side="left">
        <TopLeftText>App Interaction</TopLeftText>
        <_TransactionMeta blockchain={blockchain} hash={hash!} />
      </ListItemSide>
      <ListItemSide side="right">
        <ArrowUpRightIcon color="$baseTextMedEmphasis" />
      </ListItemSide>
    </ListItemRow>
  );
}

function _TransactionMeta({
  blockchain,
  hash,
}: {
  blockchain: ProviderId;
  hash: string;
}) {
  const blockchainLogo = getBlockchainLogo(
    blockchain.toLowerCase() as Blockchain,
    true
  );

  const formattedHash = formatWalletAddress(hash);
  return (
    <XStack ai="center" space={8}>
      <ListItemIconCore radius={2} size={12} image={blockchainLogo} />
      <ListItemStyledText fontSize="$sm" color="$baseTextMedEmphasis">
        {formattedHash}
      </ListItemStyledText>
    </XStack>
  );
}

const ListItemRow = styled(XStack, {
  flex: 1,
  justifyContent: "space-between",
  alignItems: "center",
});

const ListItemSide = styled(YStack, {
  space: 4,
  variants: {
    side: {
      left: {
        maxWidth: "60%",
        f: 1,
        mr: 24,
        jc: "center",
      },
      right: {
        maxWidth: "40%",
        f: 1,
        jc: "center",
        ai: "flex-end",
      },
    },
  } as const,
});

const ListItemStyledText = (props: any) => (
  <StyledText
    textOverflow="ellipsis"
    color="$baseTextHighEmphasis"
    numberOfLines={1}
    {...props}
  />
);

const TopLeftText = ({ children }: { children: string }) => (
  <ListItemStyledText fontSize="$lg" color="$baseTextHighEmphasis">
    {children}
  </ListItemStyledText>
);

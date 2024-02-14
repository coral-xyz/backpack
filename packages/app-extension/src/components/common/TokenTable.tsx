import { useEffect, useMemo, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as WindowedList } from "react-window";
import { type Blockchain, UNKNOWN_ICON_SRC } from "@coral-xyz/common";
import { type GetTokenBalancesQuery } from "@coral-xyz/data-components";
import { useTranslation } from "@coral-xyz/i18n";
import type { CachedTokenBalance, TokenDataWithPrice } from "@coral-xyz/recoil";
import { useActiveWallet } from "@coral-xyz/recoil";
import {
  BpInput,
  StyledText,
  temporarilyMakeStylesForBrowserExtension,
  useTheme,
  YStack,
} from "@coral-xyz/tamagui";
import SearchIcon from "@mui/icons-material/Search";
import { ListItemButton, Skeleton } from "@mui/material";

import { BalancesTableCell } from "../Unlocked/Balances/Balances";

import { Scrollbar } from "./Layout/Scrollbar";

export type Token = TokenDataWithPrice;

const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
  skeleton: {
    background: theme.baseBackgroundL1.val,
  },
}));

export type TokenTableBalance = NonNullable<
  NonNullable<GetTokenBalancesQuery["wallet"]>["balances"]
>["tokens"]["edges"][number]["node"];

export function SearchableTokenTable({
  customFilter = () => true,
  onClickRow,
  tokens,
}: {
  customFilter?: (token: CachedTokenBalance | TokenTableBalance) => boolean;
  onClickRow: (
    blockchain: Blockchain,
    token: CachedTokenBalance | TokenTableBalance
  ) => void;
  tokens: (CachedTokenBalance | TokenTableBalance)[];
}) {
  const [searchFilter, setSearchFilter] = useState("");
  const theme = useTheme();
  const { t } = useTranslation();
  const wallet = useActiveWallet();

  return (
    <YStack height="100%" space="$3">
      <YStack paddingHorizontal="$4">
        <BpInput
          placeholder={t("search")}
          value={searchFilter}
          onChangeText={(text) => setSearchFilter(text)}
          iconStart={<SearchIcon style={{ color: theme.baseIcon.val }} />}
        />
      </YStack>
      <WalletTokenTable
        onClickRow={onClickRow}
        searchFilter={searchFilter}
        tokens={tokens}
        customFilter={customFilter}
        wallet={wallet}
      />
    </YStack>
  );
}

function WalletTokenTable({
  onClickRow,
  wallet,
  searchFilter = "",
  tokens,
  customFilter = () => true,
}: {
  onClickRow: (
    blockchain: Blockchain,
    token: CachedTokenBalance | TokenTableBalance,
    publicKey: string
  ) => void;
  wallet: { name: string; publicKey: string; blockchain: Blockchain };
  searchFilter?: string;
  tokens: (CachedTokenBalance | TokenTableBalance)[];
  customFilter?: (token: CachedTokenBalance | TokenTableBalance) => boolean;
}) {
  const [search, setSearch] = useState(searchFilter);
  const { t } = useTranslation();
  const theme = useTheme();

  const tokenAccountsFiltered = useMemo<any[]>(() => {
    const searchLower = search.toLowerCase();
    let results = tokens.filter(
      (t) =>
        t.tokenListEntry &&
        (t.tokenListEntry.name.toLowerCase().startsWith(searchLower) ||
          t.tokenListEntry.symbol.toLowerCase().startsWith(searchLower))
    );

    if (customFilter) results = results.filter(customFilter);
    return results;
  }, [customFilter, tokens, search]);

  const noResults = tokenAccountsFiltered.length === 0 && search.length > 0;

  useEffect(() => {
    setSearch(searchFilter);
  }, [searchFilter]);

  return (
    <YStack flex={1} position="relative" width="100%">
      <YStack height="100%" position="absolute" width="100%">
        {noResults ? (
          <YStack>
            <StyledText color={theme.baseTextMedEmphasis} pl={24}>
              {t("no_results_for", { searchFilter: search })}
            </StyledText>
          </YStack>
        ) : (
          <AutosizedWindowedList
            itemData={{
              tokenList: tokenAccountsFiltered,
              blockchain: wallet.blockchain,
              onClickRow: (token: CachedTokenBalance | TokenTableBalance) => {
                onClickRow(
                  wallet.blockchain,
                  token,
                  wallet.publicKey.toString()
                );
              },
            }}
            itemCount={tokenAccountsFiltered.length}
            overscanCount={12}
          />
        )}
      </YStack>
    </YStack>
  );
}

type WindowedListProps = React.ComponentProps<typeof WindowedList>;
export function AutosizedWindowedList(
  props: Partial<Omit<WindowedListProps, "itemCount">> &
    Required<Pick<WindowedListProps, "itemCount">> & {
      renderer?: typeof WindowedTokenRowRenderer;
    }
) {
  // Note: if this fixed height changes in react-xnft-renderer it'll need to be changed here
  const ROW_HEIGHT = 68;

  const Renderer = props.renderer ?? WindowedTokenRowRenderer;

  return (
    <AutoSizer>
      {({ height, width }: { height: number; width: number }) => (
        <WindowedList
          outerElementType={Scrollbar}
          height={height}
          width={width}
          style={{ overflow: "hidden" }}
          itemSize={ROW_HEIGHT}
          overscanCount={12}
          {...props}
        >
          {Renderer as any /* TODO: look at type casting issue */}
        </WindowedList>
      )}
    </AutoSizer>
  );
}

export const SkeletonRow = ({
  backgroundColor,
}: {
  backgroundColor?: string;
}) => {
  const classes = useStyles();
  return (
    <ListItemButton
      disableRipple
      style={{
        borderRadius: 16,
        cursor: "auto",
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: "16px",
        paddingRight: "16px",
        padding: 0,
        height: "68px",
      }}
    >
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Skeleton
          variant="circular"
          width={44}
          height={44}
          className={classes.skeleton}
          style={{ backgroundColor }}
        />
        <div style={{ marginLeft: "5px", width: "50%" }}>
          <Skeleton
            width="50%"
            height={40}
            className={classes.skeleton}
            style={{ marginTop: "-6px", backgroundColor }}
          />
          <Skeleton
            width="80%"
            height={20}
            className={classes.skeleton}
            style={{ marginTop: "-6px", backgroundColor }}
          />
        </div>
      </div>
    </ListItemButton>
  );
};

//
// Token row renderer if virtualization is used for the table.
// Cuts down on rerenders.
//
function WindowedTokenRowRenderer({
  index,
  data,
  style,
}: {
  index: number;
  data: {
    onClickRow: (token: CachedTokenBalance | TokenTableBalance) => void;
    tokenList: (CachedTokenBalance | TokenTableBalance)[];
  };
  style: any;
}) {
  const token = data.tokenList[index];
  return (
    <TokenRow
      key={token.token}
      token={token}
      onClick={() => data.onClickRow(token)}
      style={style}
    />
  );
}

//
// Displays an individual token row in the table
//
function TokenRow({
  onClick,
  token,
  style,
}: {
  onClick: (token: CachedTokenBalance | TokenTableBalance) => void;
  token: CachedTokenBalance | TokenTableBalance;
  style?: any;
}) {
  let subtitle = token.tokenListEntry?.symbol;
  if (token.displayAmount) {
    subtitle = `${parseFloat(
      token.displayAmount
    ).toLocaleString()} ${subtitle}`;
  }

  return (
    <YStack
      hoverStyle={{
        cursor: "pointer",
        backgroundColor: "$baseBackgroundL2",
      }}
      paddingHorizontal="$4"
      style={style}
      onPress={() => onClick(token)}
    >
      <BalancesTableCell
        props={{
          icon: token.tokenListEntry?.logo ?? UNKNOWN_ICON_SRC,
          title: token.tokenListEntry?.name || "Unknown Token",
          subtitle,
          usdValue: token.marketData?.value,
          balanceChange: token.marketData?.valueChange,
        }}
      />
    </YStack>
  );
}

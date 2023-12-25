import React, { useState } from "react";
import {
  Image,
  ScrollBar,
  Text,
  TextField,
  useNavigation,
  View,
} from "react-xnft";
import { createSelector } from "reselect";

import type { StateType } from "../state";
import { connect } from "../state";

import { green, red } from "./_helpers/color";
import formatPrice from "./_helpers/formatPrice";
import type { TokenInfoType } from "./_types/TokenInfoType";
import ArrowDownIcon from "./ArrowDownIcon";
import ArrowUpIcon from "./ArrowUpIcon";
import CenteredLoader from "./CenteredLoader";
import InlineGraph from "./InlineGraph";

type Props = {};

type StateProps = {
  filter: string;
  tokenInfos: StateType["tokenInfos"];
  tokenList: StateType["tokenList"];
  favorites: StateType["favorites"];
};

function TokenList({ tokenList, tokenInfos, favorites }: Props & StateProps) {
  const [filter, setFilter] = useState<string>("");
  const nav = useNavigation();

  if (!tokenList) {
    return <CenteredLoader />;
  }

  const favoritesList = tokenList.filter((token) => favorites[token]);
  const nonFavoritesList = tokenList.filter((token) => !favorites[token]);
  nonFavoritesList.length =
    favoritesList.length > 20 ? 0 : 20 - favoritesList.length;

  let filteredList: typeof tokenList | undefined;

  if (filter !== "") {
    const regex = new RegExp(filter, "i");
    filteredList = tokenList.filter(
      (token) =>
        regex.test(tokenInfos[token]?.name) ||
        regex.test(tokenInfos[token]?.symbol) ||
        regex.test(token)
    );
    filteredList.length = 20;
  }

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "10px 0px",
        cursor: "pointer",
      }}
    >
      <View
        style={{
          display: "flex",
          padding: "0px 16px",
          paddingBottom: "10px",
        }}
      >
        <TextField
          placeholder="Search all assets"
          onChange={(e) => {
            setFilter(e.target.value);
          }}
          value={filter}
        />
      </View>
      <View
        style={{
          display: "flex",
          flexGrow: 1,
          position: "relative",
        }}
      >
        <ScrollBar>
          {filteredList &&
            filteredList.map((token) =>
              renderToken(tokenInfos[token], favorites[token], nav)
            )}
          {!filteredList &&
            favoritesList.map((token) =>
              renderToken(tokenInfos[token], favorites[token], nav)
            )}
          {!filteredList &&
            nonFavoritesList.map((token) =>
              renderToken(tokenInfos[token], favorites[token], nav)
            )}
        </ScrollBar>
      </View>
    </View>
  );
}

function renderToken(
  token: TokenInfoType,
  isFavorited: boolean,
  nav: ReturnType<typeof useNavigation>
) {
  const changePercent = formatPrice(token.price_change_percentage_24h);
  const currentPrice = formatPrice(token.current_price);
  const Arrow =
    (token.price_change_percentage_24h ?? 0) + 0 > 0 ? (
      <ArrowUpIcon isFilled={true} color={green} height={10} width={15} />
    ) : (
      <ArrowDownIcon isFilled={true} color={red} height={10} width={15} />
    );
  const color = (token.price_change_percentage_24h ?? 0) + 0 > 0 ? green : red;

  return (
    <View
      style={{
        padding: "8px 16px",
        display: "flex",
        position: "relative",
      }}
      key={token.id}
      onClick={() => nav.push("details", { token })}
    >
      <View
        style={{
          display: "flex",
          alignItems: "center",
          paddingRight: "12px",
          justifyContent: "center",
        }}
      >
        <Image
          style={{
            width: "34px",
            // padding:"5px"
          }}
          src={token.image}
        />
      </View>
      <View
        style={{
          display: "flex",
          flexGrow: 1,
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Text
          style={{
            font: "Inter",
            lineHeight: "24px",
            fontSize: "16px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >{`${token.name}${isFavorited ? " ★" : ""}`}</Text>
        <Text
          style={{
            font: "Inter",
            lineHeight: "24px",
            fontSize: "16px",
            color: "#A1A1AA",
          }}
        >{`${token.symbol.toLocaleUpperCase()}`}</Text>
      </View>
      <View
        style={{
          display: "flex",
          alignItems: "center",
          paddingRight: "16px",
        }}
      >
        <InlineGraph
          data={token.sparkline_in_7d.price}
          height={20}
          width={60}
          color={color}
        />
      </View>
      <View
        style={{
          position: "relative",
          minWidth: "71px",
        }}
      >
        <Text
          style={{
            font: "Inter",
            fontSize: "16px",
            textAlign: "right",
            fontFeatureSettings: "tnum",
          }}
        >{`${currentPrice}`}</Text>
        <Text
          style={{
            font: "Inter",
            fontSize: "16px",
            textAlign: "right",
            paddingRight: "16px",
            fontFeatureSettings: "tnum",
            color: color,
          }}
        >{`${changePercent}%`}</Text>
        <View
          style={{
            position: "absolute",
            right: "0px",
            top: "32px",
          }}
        >
          {Arrow}
        </View>
      </View>
    </View>
  );
}

const selector = createSelector(
  (state: StateType) => state.tokenInfos,
  (state: StateType) => state.tokenList,
  (state: StateType) => state.favorites,
  (tokenInfos, tokenList, favorites) => ({ tokenInfos, tokenList, favorites })
);

export default connect<Props, StateProps>(selector)(TokenList);

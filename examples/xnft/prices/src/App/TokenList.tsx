import React, { useState } from "react";
import {
  Text,
  View,
  Image,
  TextField,
  useNavigation,
  ScrollBar,
  useTheme,
} from "react-xnft";
import { connect, StateType, useDispatch } from "../state";
import { createSelector } from "reselect";
import CenteredLoader from "./CenteredLoader";
import { green, red } from "./_helpers/color";
import formatPrice from "./_helpers/formatPrice";
import { TokenInfoType } from "./_types/TokenInfoType";

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
          placeholder="Filter Assets..."
          onChange={(e) => setFilter(e.data.value)}
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
  const arrow = (token.price_change_percentage_24h ?? 0) + 0 > 0 ? "↗" : "↘";
  const color = (token.price_change_percentage_24h ?? 0) + 0 > 0 ? green : red;

  return (
    <View
      style={{
        padding: "8px 16px",
        display: "flex",
      }}
      key={token.id}
      onClick={() => nav.push("details", { token })}
    >
      <View
        style={{
          padding: "5px",
          paddingRight: "10px",
          display: "flex",
          alignItems: "center",
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
        }}
      >
        <Text
          style={{
            lineHeight: "24px",
          }}
        >{`${token.name} ${isFavorited ? "★" : ""}`}</Text>
        <Text
          style={{
            opacity: 0.5,
          }}
        >{`${token.symbol.toLocaleUpperCase()}`}</Text>
      </View>
      <View
        style={
          {
            // width: "100px"
          }
        }
      >
        <Text
          style={{
            textAlign: "right",
          }}
        >{`$${currentPrice}`}</Text>
        <Text
          style={{
            font: "Inter",
            fontSize: "16px",
            textAlign: "right",
            color: color,
          }}
        >{`${arrow} ${changePercent}%`}</Text>
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

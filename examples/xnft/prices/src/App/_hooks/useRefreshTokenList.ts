import { useEffect } from "react";
import { useDispatch } from "../../state";
import { SET_TOKENLIST } from "../_actions/SET_TOKENLIST";
import { TokenListType } from "../_types/TokenListType";

const refreshtime = 1000 * 60;
const count = 250;
const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${count}&page=1&sparkline=true&price_change_percentage=24h`;

function useRefreshTokenList() {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchTokenList = () => {
      fetch(url)
        .then(async (response) => {
          const json = await response.json();
          if (TokenListType.is(json)) {
            dispatch(
              SET_TOKENLIST({
                tokenData: json,
              })
            );
          } else {
            throw TokenListType.validate(json)[0];
          }
        })
        .catch((e) => {
          console.error(e, "refreshing in", refreshtime);
        });
    };
    fetchTokenList();
    const refresh = setInterval(fetchTokenList, refreshtime);
    return () => {
      clearInterval(refresh);
    };
  }, []);
}

export default useRefreshTokenList;

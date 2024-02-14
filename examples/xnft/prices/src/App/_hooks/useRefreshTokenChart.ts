import { useEffect } from "react";
import { useDispatch } from "../../state";
import { SET_TOKEN_CHART } from "../_actions/SET_TOKEN_CHART";
import { getChartDataTime } from "../_helpers/getChartDataTime";
import { ChartDataType } from "../_types/ChartDataType";
import { ChartType } from "../_types/ChartType";

const refreshtime = 1000 * 60;

const getUrl = (tokenId: string, chart: ChartType) => {
  const days = ["1H", "1D"].includes(chart)
    ? "1"
    : ["1W", "1M"].includes(chart)
    ? "90"
    : "max";

  return `https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart?vs_currency=usd&days=${days}`;
};

function useRefreshTokenChart(tokenId: string, chart: ChartType) {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchTokenChart = () => {
      fetch(getUrl(tokenId, chart))
        .then((r) => r.json())
        .then((chartData) => {
          if (ChartDataType.is(chartData)) {
            dispatch(
              SET_TOKEN_CHART({
                tokenId,
                chartData: {
                  [getChartDataTime(chart)]: chartData.prices,
                },
              })
            );
          } else {
            throw ChartDataType.validate(chartData)[0];
          }
        })
        .catch((e) => {
          console.error(e, "refreshing in", refreshtime);
        });
    };
    fetchTokenChart();
    const refresh = setInterval(fetchTokenChart, refreshtime);
    return () => {
      clearInterval(refresh);
    };
  }, [tokenId, chart]);
}

export default useRefreshTokenChart;

import { scaleLinear, scaleTime } from "d3-scale";
import { line, curveLinear as curveType } from "d3-shape";
import { GraphDataPointType } from "../_types/GraphDataPointType";

const makeGraph = (
  data: GraphDataPointType[],
  width: number,
  height: number
) => {
  const max = Math.max(...data.map((val) => val[1]));
  const min = Math.min(...data.map((val) => val[1]));
  const y = scaleLinear()
    .domain([min, max])
    .range([height - 0, 0]);

  const x = scaleTime()
    .domain([new Date(data[0][0]), new Date(data[data.length - 1][0])])
    .range([0, width - 0]);

  const curvedLine = line<GraphDataPointType>()
    .x((d) => x(new Date(d[0])))
    .y((d) => y(d[1]))
    .curve(curveType)(data);

  return {
    max,
    min,
    curve: curvedLine!,
  };
};

export default makeGraph;

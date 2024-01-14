import { ChartType } from "../_types/ChartType";
import { GraphDataPointType } from "../_types/GraphDataPointType";

const timeLabel = (time: number) => {
  const date = new Date(time);
  return `${("0" + date.getHours()).slice(-2)}:${(
    "0" + date.getMinutes()
  ).slice(-2)}`;
};
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];
const dateLabel = (time: number) => {
  const date = new Date(time);
  return `${months[date.getMonth()]} ${date.getDate()}`;
};
const yearLabel = (time: number) => {
  const date = new Date(time);
  return `${date.getFullYear()}`;
};

export const charts: ChartType[] = ["1H", "1D", "1W", "1M", "1Y", "ALL"];

function filterChartData(
  chart: string,
  data: GraphDataPointType[] | undefined
): {
  labels: string[];
  points: GraphDataPointType[];
} | null {
  if (!data) {
    return null;
  }
  switch (chart) {
    case "1H": {
      const time = 1000 * 60 * 60;
      const points = data.filter(
        (point, i, a) => point[0] >= a[a.length - 1][0] - time
      );
      return {
        points,
        labels: [
          timeLabel(points[0][0]),
          timeLabel(points[Math.floor(points.length / 4)][0]),
          timeLabel(points[Math.floor((points.length * 2) / 4)][0]),
          timeLabel(points[Math.floor((points.length * 3) / 4)][0]),
          timeLabel(points[points.length - 1][0]),
        ],
      };
    }
    case "1D": {
      const points = data.filter((_, i, a) => i % 1 === 0 || i === a.length);
      return {
        points,
        labels: [
          timeLabel(points[0][0]),
          timeLabel(points[Math.floor((points.length * 1) / 4)][0]),
          timeLabel(points[Math.floor((points.length * 2) / 4)][0]),
          timeLabel(points[Math.floor((points.length * 3) / 4)][0]),
          timeLabel(points[points.length - 1][0]),
        ],
      };
    }
    case "1W": {
      const time = 1000 * 60 * 60 * 24 * 7;
      const points = data.filter(
        (point, i, a) => point[0] >= a[a.length - 1][0] - time
      );
      return {
        points,
        labels: [
          dateLabel(points[0][0]),
          dateLabel(points[Math.floor(points.length / 4)][0]),
          dateLabel(points[Math.floor((points.length * 2) / 4)][0]),
          dateLabel(points[Math.floor((points.length * 3) / 4)][0]),
          dateLabel(points[points.length - 1][0]),
        ],
      };
    }
    case "1M": {
      const time = 1000 * 60 * 60 * 24 * 30;
      const points = data.filter(
        (point, i, a) => point[0] >= a[a.length - 1][0] - time
      );
      return {
        points,
        labels: [
          dateLabel(points[0][0]),
          dateLabel(points[Math.floor(points.length / 4)][0]),
          dateLabel(points[Math.floor((points.length * 2) / 4)][0]),
          dateLabel(points[Math.floor((points.length * 3) / 4)][0]),
          dateLabel(points[points.length - 1][0]),
        ],
      };
    }
    case "1Y": {
      const time = 1000 * 60 * 60 * 24 * 365;
      const points = data.filter(
        (point, i, a) => point[0] >= a[a.length - 1][0] - time
      );
      return {
        points,
        labels: [
          dateLabel(points[0][0]),
          dateLabel(points[Math.floor((points.length * 1) / 4)][0]),
          dateLabel(points[Math.floor((points.length * 2) / 4)][0]),
          dateLabel(points[Math.floor((points.length * 3) / 4)][0]),
          dateLabel(points[points.length - 1][0]),
        ],
      };
    }
    default: {
      const points = data;
      return {
        points: data,
        labels: [
          yearLabel(points[0][0]),
          yearLabel(points[Math.floor((points.length * 1) / 4)][0]),
          yearLabel(points[Math.floor((points.length * 2) / 4)][0]),
          yearLabel(points[Math.floor((points.length * 3) / 4)][0]),
          yearLabel(points[points.length - 1][0]),
        ],
      };
    }
  }
}

export default filterChartData;

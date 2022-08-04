import { Svg, Path } from "react-xnft";

export function MonitorIcon({ fill = "#FFEFEB" }) {
  return (
    <Svg width="25" height="25" viewBox="0 0 25 25" fill="none">
      <Path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        fill={fill}
      />
    </Svg>
  );
}

export function ChartBar({ fill = "#FFEFEB" }) {
  return (
    <Svg width="25" height="25" viewBox="0 0 25 25" fill="none">
      <Path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        fill={fill}
      />
    </Svg>
  );
}

//
// <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
//      stroke="currentColor" stroke-width="2">
//     <path stroke-linecap="round" stroke-linejoin="round"
//           d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
// </svg>

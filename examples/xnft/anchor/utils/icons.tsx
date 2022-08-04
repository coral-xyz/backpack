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

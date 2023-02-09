import type { CustomTheme } from "@coral-xyz/themes";
import { styles } from "@coral-xyz/themes/";
import CircularProgress from "@mui/material/CircularProgress";
const useStyles = styles((theme: CustomTheme) => ({
  circle: {
    stroke: "url(#linearColors)",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    height: "100%",
  },
  loadingIndicator: {
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    color:
      "linear-gradient(113.94deg, #3EECB8 15.93%, #A372FE 58.23%, #FE7D4A 98.98%)",
  },
}));

export function Loading(props: any) {
  const classes = useStyles();
  return (
    <div style={props.style} className={classes.loadingContainer}>
      <>
        <svg style={{ position: "fixed" }}>
          <linearGradient id="linearColors" x1="0" y1="0" x2="1" y2="1">
            <stop offset="15.93%" stopColor="#3EECB8" />
            <stop offset="58.23%" stopColor="#A372FE" />
            <stop offset="98.98%" stopColor="#FE7D4A" />
          </linearGradient>
        </svg>
        <CircularProgress
          size={props.size ?? 48}
          className={classes.loadingIndicator}
          style={props.iconStyle}
          thickness={props.thickness ?? 4}
          classes={{ circle: classes.circle }}
        />
      </>
    </div>
  );
}

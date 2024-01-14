import {
  Loader,
  temporarilyMakeStylesForBrowserExtension,
} from "@coral-xyz/tamagui";

const useStyles = temporarilyMakeStylesForBrowserExtension(() => ({
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    height: "100%",
  },
}));

export function Loading(props: any) {
  const classes = useStyles();
  const { style, ...restProps } = props;
  return (
    <div style={style} className={classes.loadingContainer}>
      <Loader {...restProps} />
    </div>
  );
}

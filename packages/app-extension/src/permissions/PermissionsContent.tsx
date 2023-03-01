import { styles } from "@coral-xyz/themes";
import { Typography } from "@mui/material";

const useStyles = styles(() => ({
  containerDiv: {
    height: `100vh`,
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
  containerDivInternal: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "row",
  },
  circularContainer: {
    margin: "auto",
    height: "100px",
    width: "100px",
    backgroundColor: (props: any) => props.backgroundColor,
    borderRadius: "50%",
  },
  icon: {
    marginTop: (props: any) => props.marginTop || 25,
    marginLeft: (props: any) => props.marginLeft || 25,
  },
}));
interface Props {
  title: string;
  subtitle1: string;
  subtitle2?: string;
  icon: any;
  backgroundColor: string;
  marginTop?: number;
  marginLeft?: number;
}
export const PermissionsContent = ({
  title,
  subtitle1,
  subtitle2 = "",
  icon,
  backgroundColor,
  marginTop,
  marginLeft,
}: Props) => {
  const classes = useStyles({ backgroundColor, marginTop, marginLeft });
  return (
    <div className={classes.containerDiv}>
      <div>
        <div>
          <div className={classes.containerDivInternal}>
            <div className={classes.circularContainer}>
              <div className={classes.icon}>{icon}</div>
            </div>
          </div>
          <br />
          <div className={classes.containerDivInternal}>
            <Typography variant="h5">{title}</Typography>
          </div>
          <br />
          <div className={classes.containerDivInternal}>
            <Typography variant="subtitle1">{subtitle1}</Typography>
          </div>
          <div className={classes.containerDivInternal}>
            <Typography variant="subtitle1">{subtitle2}</Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

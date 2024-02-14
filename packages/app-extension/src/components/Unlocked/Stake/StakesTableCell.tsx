import { UNKNOWN_ICON_SRC } from "@coral-xyz/common";
import { ProxyImage } from "@coral-xyz/react-common";
import { stakeStateColor } from "@coral-xyz/staking/src/shared";
import {
  StyledText,
  temporarilyMakeStylesForBrowserExtension,
  useTheme,
} from "@coral-xyz/tamagui";
import { ListItemIcon, Skeleton, Typography } from "@mui/material";

const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
  balancesTableCellContainer: {
    width: "100%",
    height: "100%",
    display: "flex",
  },
  tokenListItemContent: {
    color: theme.baseTextHighEmphasis.val,
    flex: 1,
    paddingTop: "10px",
    paddingBottom: "10px",
  },
  tokenListItemRow: {
    display: "flex",
    justifyContent: "space-between",
  },
  logoIcon: {
    borderRadius: "22px",
    width: "44px",
    height: "44px",
  },
  tokenListItemIcon: {
    paddingTop: "12px",
    paddingBottom: "12px",
    marginRight: "12px",
  },
  tokenName: {
    height: "24px",
    fontWeight: 500,
    fontSize: "16px",
    maxWidth: "200px",
    overflow: "hidden",
    color: theme.baseTextHighEmphasis.val,
    lineHeight: "24px",
  },
  tokenAmount: {
    fontWeight: 500,
    fontSize: "14px",
    color: theme.baseTextMedEmphasis.val,
    lineHeight: "20px",
  },
  tokenBalance: {
    fontWeight: 500,
    fontSize: "16px",
    color: theme.baseTextHighEmphasis.val,
    lineHeight: "24px",
  },
  tokenListItemIconRoot: {
    minWidth: "44px",
  },
}));

export function StakesTableCell({ props }: any) {
  const { validator, state, amount, reward } = props;
  const classes = useStyles();
  const theme = useTheme();

  // const epochQuery = useEpochQuery();

  return (
    <div className={classes.balancesTableCellContainer}>
      <ListItemIcon
        className={classes.tokenListItemIcon}
        classes={{ root: classes.tokenListItemIconRoot }}
      >
        {validator ? (
          <ProxyImage
            src={validator.icon || UNKNOWN_ICON_SRC}
            className={classes.logoIcon}
            onError={(event: any) => {
              event.currentTarget.src = UNKNOWN_ICON_SRC;
            }}
          />
        ) : (
          <Skeleton variant="circular" width={44} height={44} />
        )}
      </ListItemIcon>

      <div className={classes.tokenListItemContent}>
        <div className={classes.tokenListItemRow}>
          <Typography className={classes.tokenName}>
            {validator?.name}
          </Typography>
          <Typography className={classes.tokenBalance}>{amount}</Typography>
        </div>
        <div className={classes.tokenListItemRow}>
          <StyledText
            // className={classes.tokenAmount}
            color={
              (stakeStateColor as any)[state.toLowerCase()] ||
              "$baseTextMedEmphasis"
            }
            fontSize="$sm"
          >
            {state}
            {/* {["Activating", "Deactivating"].includes(state) &&
            epochQuery.data?.nextEpoch?.timeUntil
              ? ` in ${epochQuery.data.nextEpoch.timeUntil}`
              : null} */}
          </StyledText>
          {reward ? (
            <Typography
              className={classes.tokenAmount}
              style={{ color: theme.baseTextMedEmphasis.val }}
            >
              +{reward}
            </Typography>
          ) : null}
        </div>
      </div>
    </div>
  );
}

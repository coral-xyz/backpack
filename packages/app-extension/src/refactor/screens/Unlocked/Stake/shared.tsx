import { UNKNOWN_ICON_SRC } from "@coral-xyz/common";
import { ProxyImage } from "@coral-xyz/react-common";
import {
  StyledText,
  temporarilyMakeStylesForBrowserExtension,
  useTheme,
} from "@coral-xyz/tamagui";
import { ListItemIcon, Skeleton, Typography } from "@mui/material";
import type { InflationReward, StakeActivationData } from "@solana/web3.js";
import { utils } from "ethers";
import { atom } from "recoil";

import { approximateAmount } from "../Swap/SwapScreen";

export type ParsedStakeAccount = {
  context: {
    apiVersion: string;
    slot: number;
  };
  value: {
    data: {
      parsed: {
        info: {
          meta: {
            authorized: {
              staker: string;
              withdrawer: string;
            };
            lockup: {
              custodian: string;
              epoch: number;
              unixTimestamp: number;
            };
            rentExemptReserve: string;
          };
          stake: {
            creditsObserved: number;
            delegation: {
              activationEpoch: string;
              deactivationEpoch: string;
              stake: string;
              voter: string;
              warmupCooldownRate: number;
            };
          };
        };
        type: string;
      };
      program: string;
      space: number;
    };
    executable: boolean;
    lamports: number;
    owner: string;
    rentEpoch: number;
    space: number;
  };
};

export type StakeInfo = {
  validator?: {
    name?: string;
    icon?: string;
  };
  pubkey?: string;
  lamports?: number;
  rewards?: InflationReward | null;
  stakeAccount?: ParsedStakeAccount["value"]["data"]["parsed"]["info"];
  stakeActivation?: StakeActivationData;
  index?: number;
  can?: {
    merge: boolean;
  };
};

export const lamportsToSolAsString = (
  lamports: number | string,
  { approx = true, appendTicker = false } = {}
) => {
  let str = approx
    ? approximateAmount(lamports.toString())
    : utils.formatUnits(lamports, 9);
  if (str === "0.0") str = "0";
  return appendTicker ? str.concat(" SOL") : str;
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const stakeStateColor = {
  active: "$greenText",
  inactive: "$redText",
  activating: "$yellowText",
  deactivating: "$yellowText",
} as Record<StakeActivationData["state"], string>;

export const activeValidatorPubkeyAtom = atom<string>({
  key: "staking.activeValidator",
  default: "B6nDYYLc2iwYqY3zdmavMmU9GjUL2hf79MkufviM2bXv",
});

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

export const isMergeableStakeAccount = (
  publicKey: string,
  epoch?: number,
  accountToMergeInto?: StakeInfo
) => {
  const now = Date.now() / 1000;
  return (a: StakeInfo) => {
    let isMergeable = Boolean(
      a.stakeAccount &&
        a.stakeActivation &&
        epoch &&
        a.stakeActivation.state === "active" &&
        a.stakeAccount.meta.lockup.unixTimestamp < now &&
        a.stakeAccount.meta.lockup.epoch <= epoch &&
        a.stakeActivation.active > 0 &&
        a.stakeAccount.meta.authorized.withdrawer === publicKey
    );

    if (a.stakeAccount && accountToMergeInto?.stakeAccount) {
      isMergeable &&= Boolean(
        a.pubkey !== accountToMergeInto.pubkey &&
          a.stakeAccount.stake.delegation.voter ===
            accountToMergeInto.stakeAccount.stake.delegation.voter
      );
    }

    return isMergeable;
  };
};

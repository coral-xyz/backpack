import type { CSSProperties } from "react";
import { useState } from "react";
import { type Blockchain, XNFT_GG_LINK } from "@coral-xyz/common";
import {
  type ParseTransactionDetails,
  type ProviderId,
  type ResponseTransaction,
  TransactionDetails,
  TransactionHistory,
} from "@coral-xyz/data-components";
import { useTranslation } from "@coral-xyz/i18n";
import { EmptyState, Loading } from "@coral-xyz/react-common";
import {
  temporarilyMakeStylesForBrowserExtension,
  useTheme,
  YStack,
} from "@coral-xyz/tamagui";
import Bolt from "@mui/icons-material/BoltRounded";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import IconButton from "@mui/material/IconButton";

import { CloseButton, WithDrawer } from "../../common/Layout/Drawer";
import { NavBackButton } from "../../common/Layout/Nav";
import {
  NavStackEphemeral,
  NavStackScreen,
} from "../../common/Layout/NavStack";

const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
  networkSettingsButton: {
    padding: 0,
    width: "24px",
    "&:hover": {
      background: "transparent",
    },
  },
  networkSettingsIcon: {
    color: theme.custom.colors.icon,
    backgroundColor: "transparent",
    borderRadius: "12px",
  },
}));

export function TransactionsButton() {
  const classes = useStyles();
  const [openDrawer, setOpenDrawer] = useState(false);

  return (
    <>
      <IconButton
        disableRipple
        className={classes.networkSettingsButton}
        onClick={() => setOpenDrawer(true)}
        size="large"
      >
        <FormatListBulletedRoundedIcon
          className={classes.networkSettingsIcon}
        />
      </IconButton>
      <WithDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
        <div style={{ display: "flex", flex: 1 }}>
          <NavStackEphemeral
            initialRoute={{ name: "root" }}
            options={() => ({ title: "Transactions" })}
            navButtonLeft={<CloseButton onClick={() => setOpenDrawer(false)} />}
          >
            <NavStackScreen
              name="root"
              component={(props: any) => <Transactions {...props} />}
            />
          </NavStackEphemeral>
        </div>
      </WithDrawer>
    </>
  );
}

export function Transactions({
  ctx,
}: {
  ctx: { publicKey: string; blockchain: Blockchain };
}) {
  const [openDrawer, setOpenDrawer] = useState(true);
  const [selected, setSelected] = useState<{
    details: ParseTransactionDetails;
    transaction: ResponseTransaction;
  } | null>(null);

  if (selected) {
    return (
      <WithDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
        <NavStackEphemeral
          initialRoute={{ name: "transactionDetails" }}
          options={() => {
            return {
              title: selected.details?.details.title ?? "App Interaction",
            };
          }}
          navButtonLeft={<NavBackButton onClick={() => setSelected(null)} />}
        >
          <NavStackScreen
            name="transactionDetails"
            component={(props) => (
              <TransactionDetails
                containerStyle={{
                  paddingBottom: 16,
                  paddingHorizontal: 16,
                  paddingTop: 24,
                }}
                details={selected.details!}
                transaction={selected.transaction}
                {...props}
              />
            )}
          />
        </NavStackEphemeral>
      </WithDrawer>
    );
  }

  return (
    <TransactionHistory
      pagination
      addresses={[
        {
          providerId: ctx.blockchain.toUpperCase() as ProviderId,
          pubkeys: [ctx.publicKey],
        },
      ]}
      emptyStateComponent={<NoRecentActivityLabel minimize={false} />}
      fetchPolicy="cache-and-network"
      limit={50}
      loaderComponent={<TransactionsLoader />}
      loadingMoreSkeletonComponent={
        <Loading iconStyle={{ width: 35, height: 35 }} />
      }
      onItemClick={(transaction, explorer, details) => {
        if (!details) {
          window.open(explorer);
        }
        setSelected({ details: details!, transaction });
      }}
    />
  );
}

export function TransactionsLoader() {
  return (
    <YStack flex={1} justifyContent="center" alignItems="center">
      <Loading iconStyle={{ width: "35px", height: "35px" }} />
    </YStack>
  );
}

export function NoRecentActivityLabel({
  hideButton,
  minimize,
  style,
}: {
  hideButton?: boolean;
  minimize: boolean;
  style?: CSSProperties;
}) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <YStack
      display={minimize ? "none" : "flex"}
      flex={1}
      alignItems="center"
      justifyContent="center"
      padding="$1"
    >
      <EmptyState
        icon={(props: any) => <Bolt {...props} />}
        title={t("no_recent_activity.title")}
        subtitle={t("no_recent_activity.subtitle")}
        onClick={() => window.open(XNFT_GG_LINK)}
        buttonText={hideButton ? undefined : t("browse_xnft")}
        contentStyle={{
          color: minimize ? theme.baseTextMedEmphasis.val : "inherit",
        }}
        minimize={minimize}
        innerStyle={{
          ...style,
        }}
      />
    </YStack>
  );
}

import { useState } from "react";
import {
  type ParseTransactionDetails,
  type ResponseTransaction,
  TransactionDetails,
  TransactionHistory,
} from "@coral-xyz/data-components";
import { Loading } from "@coral-xyz/react-common";
import { useFeatureGates } from "@coral-xyz/recoil";
import { styles } from "@coral-xyz/themes";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import IconButton from "@mui/material/IconButton";

import { CloseButton, WithDrawer } from "../../common/Layout/Drawer";
import { NavBackButton } from "../../common/Layout/Nav";
import {
  NavStackEphemeral,
  NavStackScreen,
} from "../../common/Layout/NavStack";
import { RecentActivity as LegacyTransactions } from "../Balances/RecentActivity";

const useStyles = styles((theme) => ({
  networkSettingsButtonContainer: {
    display: "flex",
    flexDirection: "row-reverse",
    width: "38px",
  },
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
  const gates = useFeatureGates();
  const [openDrawer, setOpenDrawer] = useState(false);

  const _Component = gates.GQL_TRANSACTION_HISTORY
    ? Transactions
    : LegacyTransactions;

  return (
    <div className={classes.networkSettingsButtonContainer}>
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
        <div style={{ height: "100%" }}>
          <NavStackEphemeral
            initialRoute={{ name: "root" }}
            options={() => ({ title: "Transactions" })}
            navButtonLeft={<CloseButton onClick={() => setOpenDrawer(false)} />}
          >
            <NavStackScreen
              name="root"
              component={(props: any) => <_Component {...props} />}
            />
          </NavStackEphemeral>
        </div>
      </WithDrawer>
    </div>
  );
}

export function Transactions() {
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
      loaderComponent={<TransactionsLoader />}
      onItemClick={(transaction, explorer, details) => {
        if (!details) {
          window.open(explorer);
        }
        setSelected({ details: details!, transaction });
      }}
    />
  );
}

function TransactionsLoader() {
  return (
    <div
      style={{
        height: "68px",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Loading iconStyle={{ width: "35px", height: "35px" }} />
      </div>
    </div>
  );
}

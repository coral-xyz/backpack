import { parseTransaction,TransactionDetails  } from "@coral-xyz/data-components";
import { useTranslation } from "@coral-xyz/i18n";

import { ScreenContainer } from "../../../components/ScreenContainer";
import type { ActivityDetailScreenProps } from "../../../navigation/WalletsNavigator";

export function ActivityDetailScreen(props: ActivityDetailScreenProps) {
  return (
    <ScreenContainer loading={<Loading />}>
      <Container {...props} />
    </ScreenContainer>
  );
}

function Loading() {
  // TODO.
  return null;
}

function Container({
  route: {
    params: { transaction },
  },
}: ActivityDetailScreenProps) {
  const { t } = useTranslation();
  const details = parseTransaction(transaction, t);
  if (!details) {
    throw new Error("activity details not found");
  }
  return (
    <TransactionDetails
      containerStyle={{
        paddingBottom: 16,
        paddingHorizontal: 16,
        paddingTop: 24,
      }}
      details={details}
      transaction={transaction}
    />
  );
}

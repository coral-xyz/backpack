import { useState, useEffect } from "react";
import {
  useNavigation,
  usePublicKey,
  useConnection,
  BalancesTable,
  BalancesTableHead,
  BalancesTableContent,
  BalancesTableFooter,
  BalancesTableRow,
  BalancesTableCell,
} from "@coral-xyz/anchor-ui";
import { fetchDegodTokens, DEGODS_ICON_DATA, EMPTY_DEGODS_ICON } from "./utils";
import { StakeDetail } from "./app";

export function Widget() {
  return <DegodsTable />;
}

function DegodsTable() {
  const nav = useNavigation();
  const publicKey = usePublicKey();
  const connection = useConnection();
  const [tokenAccounts, setTokenAccounts] = useState<any>(null);

  useEffect(() => {
    (async () => {
      setTokenAccounts(null);
      const tas = await fetchDegodTokens(publicKey, connection);
      setTokenAccounts(tas);
    })();
  }, [publicKey, connection]);

  return (
    <BalancesTable>
      <BalancesTableHead title={"Staked Degods"} iconUrl={DEGODS_ICON_DATA} />
      {tokenAccounts === null ? (
        <BalancesTableContent></BalancesTableContent>
      ) : tokenAccounts.length === 0 ? (
        <BalancesTableContent>
          <BalancesTableRow onClick={() => nav.push(<StakeDetail />)}>
            <BalancesTableCell
              title={"Stake your Degods"}
              icon={EMPTY_DEGODS_ICON}
              subtitle={"Earn $DUST now"}
              usdValue={0}
            />
          </BalancesTableRow>
        </BalancesTableContent>
      ) : (
        <BalancesTableContent>
          {/* TODO: Add estimated DUST */}
          {tokenAccounts.map((t) => {
            return (
              <BalancesTableRow
                key={t.publicKey.toString()}
                onClick={() => nav.push(<StakeDetail token={t} />)}
              >
                <BalancesTableCell
                  title={t.tokenMetaUriData.name}
                  icon={t.tokenMetaUriData.image}
                  subtitle={t.tokenMetaUriData.collection.family}
                />
              </BalancesTableRow>
            );
          })}
        </BalancesTableContent>
      )}
      <BalancesTableFooter></BalancesTableFooter>
    </BalancesTable>
  );
}

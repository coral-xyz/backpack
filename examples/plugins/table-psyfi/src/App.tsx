import AnchorUi, {
  BalancesTable,
  BalancesTableContent,
  BalancesTableHead,
  BalancesTableCell,
  BalancesTableRow,
} from "@coral-xyz/anchor-ui";
import { useEffect, useState } from "react";
import { Vault } from "./types";
import { fetchAllVaults } from "./utils";

export const App = () => {
  const [vaults, setVaults] = useState<Record<string, Vault>>({});
  useEffect(() => {
    (async () => {
      const resp = await fetchAllVaults();
      if (resp) {
        setVaults(resp.vaults);
      }
    })();
  }, []);

  // TODO get SPL token values for vault
  return (
    <BalancesTable>
      <BalancesTableHead
        title="PsyFinance Vaults"
        iconUrl="https://uploads-ssl.webflow.com/6158e3591ba06d14de4fd0df/61f900784e63439a5a052fed_PsyOptions.svg"
      />
      <BalancesTableContent>
        {Object.keys(vaults).map((key) => {
          const vault = vaults[key];
          return (
            <BalancesTableRow key={key}>
              <BalancesTableCell title={vault.name} />
            </BalancesTableRow>
          );
        })}
      </BalancesTableContent>
    </BalancesTable>
  );
};

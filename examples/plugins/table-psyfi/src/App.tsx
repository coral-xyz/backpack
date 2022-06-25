import {
  BalancesTable,
  BalancesTableContent,
  BalancesTableHead,
  BalancesTableCell,
  BalancesTableRow,
} from "@coral-xyz/anchor-ui";
import {
  TokenContextProvider,
  useTokenMap,
  useVaultMetadata,
  VaultMetadataProvider,
} from "./context";

export const App = () => {
  return (
    <TokenContextProvider>
      <VaultMetadataProvider>
        <VaultTable />
      </VaultMetadataProvider>
    </TokenContextProvider>
  );
};

const VaultTable: React.VFC = () => {
  const vaults = useVaultMetadata();
  const tokenMap = useTokenMap();

  return (
    <BalancesTable>
      <BalancesTableHead
        title="PsyFinance Vaults"
        iconUrl="https://uploads-ssl.webflow.com/6158e3591ba06d14de4fd0df/61f900784e63439a5a052fed_PsyOptions.svg"
      />
      <BalancesTableContent>
        {Object.keys(vaults)
          .filter(
            (key) =>
              // @ts-ignore delete wen better typing
              !!tokenMap[vaults[key].accounts.vaultOwnershipTokenMint]?.amount
          )
          .map((id) => (
            <VaultBalanceRow key={id} id={id} />
          ))}
      </BalancesTableContent>
    </BalancesTable>
  );
};

const VaultBalanceRow: React.VFC<{ id: string }> = ({ id }) => {
  const tokenMap = useTokenMap();
  const vaults = useVaultMetadata();
  const vault = vaults[id];
  const holdings =
    // @ts-ignore delete wen better typing
    !!tokenMap[vaults[key].accounts.vaultOwnershipTokenMint]?.amount;

  return (
    <BalancesTableRow>
      <BalancesTableCell title={vault.name} subtitle={holdings} />
    </BalancesTableRow>
  );
};

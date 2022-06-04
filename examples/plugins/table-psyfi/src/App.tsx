import AnchorUi, {
  BalancesTable,
  BalancesTableContent,
  BalancesTableHead,
} from "@200ms/anchor-ui";
// import { fetchAllVaults } from "./utils";

// AnchorUi.events.on('connect', () => {
//   fetchAllVaults()
// });

export const App = () => {
  return (
    <BalancesTable>
      <BalancesTableHead
        title="PsyFinance Vaults"
        iconUrl="https://uploads-ssl.webflow.com/6158e3591ba06d14de4fd0df/61f900784e63439a5a052fed_PsyOptions.svg"
      />
      <BalancesTableContent />
    </BalancesTable>
  );
};

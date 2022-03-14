import { makeStyles } from "@material-ui/core";
//import { useNavigationContext } from "../../../context/Navigation";
import { toTitleCase, BlockchainCard } from ".";

const useStyles = makeStyles((theme: any) => ({
  cardContainer: {},
}));

export function Network({ blockchain }: any) {
  return (
    <div>
      <NetworkHeader />
      <BlockchainCard blockchain={blockchain} title={"All Wallets"} />
    </div>
  );
}

function NetworkHeader() {
  return <div style={{ marginTop: "12px" }}></div>;
}

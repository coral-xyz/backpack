import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import AnchorUi, {
  useNavigation,
  Text,
  TextField,
  View,
  Button,
  BalancesTable,
  BalancesTableHead,
  BalancesTableContent,
  BalancesTableFooter,
  BalancesTableRow,
  BalancesTableCell,
} from "@coral-xyz/anchor-ui";

const ANCHOR_ICON =
  "https://pbs.twimg.com/profile_images/1537173219693711363/maYBbQGF_400x400.jpg";

//
// On connection to the host environment, warm the cache.
//
AnchorUi.events.on("connect", () => {
  //
});

export function App() {
  return <AnchorTable />;
}

function AnchorTable() {
  const nav = useNavigation();
  return (
    <BalancesTable>
      <BalancesTableHead title={"Anchor Dev Tools"} iconUrl={ANCHOR_ICON} />
      <BalancesTableContent>
        <BalancesTableRow onClick={() => nav.push(<AnchorDetail />)}>
          <BalancesTableCell
            title={"Anchor Shell"}
            subtitle={"Open an interactive shell"}
            icon={ANCHOR_ICON}
          />
        </BalancesTableRow>
      </BalancesTableContent>
      <BalancesTableFooter></BalancesTableFooter>
    </BalancesTable>
  );
}

function AnchorDetail({}: any) {
  const [val, setVal] = useState("");
  const fetchIdl = async () => {
    console.log("fetching idl here");
    try {
      const programId = new PublicKey(val);
      const idl = await Program.fetchIdl(programId, window.backpack);
      console.log("idl here", idl);
    } catch (err) {
      console.error("error fetching IDL", err);
    }
  };
  return (
    <View>
      <Text>Program ID</Text>
      <TextField
        onChange={(e) => setVal(e.data.value)}
        value={val}
        placeholder={"Enter your program ID..."}
      />
      <Button onClick={() => fetchIdl()}>Fetch IDL</Button>
    </View>
  );
}

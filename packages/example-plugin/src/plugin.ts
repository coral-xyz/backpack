import { Market, OpenOrders } from "@project-serum/serum";
import { PublicKey } from "@solana/web3.js";
import {
  context,
  View,
  TypographyView,
  TableViewController,
  TableViewControllerDelegate,
  App,
  AppDelegate,
} from "@200ms/anchor-ui";
import * as anchor from "@project-serum/anchor";

export class Example implements AppDelegate {
  didLaunch(app: App) {
    app.setRootViewController(new OpenOrdersViewController());
  }
}

class OpenOrdersViewController
  extends TableViewController
  implements TableViewControllerDelegate
{
  private openOrders: Array<any>;
  private marketMap: Map<string, Market>;

  constructor(props?: any) {
    super(props);
    this.openOrders = [];
    this.marketMap = new Map();
    this.delegate = this;
  }

  //
  // @overrides ViewController.
  //
  async viewWillAppear() {
    const ctx = context();

    //
    // All open orders accounts for this wallet.
    //
    this.openOrders = await OpenOrders.findForOwner(
      ctx.connection,
      ctx.publicKey,
      PID
    );

    //
    // Maps market address string -> market client.
    //
    this.marketMap = await (async () => {
      const markets = (() => {
        const markets = new Set<string>();
        this.openOrders.forEach((oo) => {
          markets.add(oo.market.toString());
        });
        return markets;
      })();

      const multipleMarkets = await anchor.utils.rpc.getMultipleAccounts(
        ctx.connection,
        Array.from(markets.values()).map((m) => new PublicKey(m))
      );
      return new Map(
        multipleMarkets.map((programAccount) => {
          return [
            programAccount!.publicKey.toString(),
            new Market(
              Market.getLayout(PID).decode(programAccount?.account.data),
              -1, // Not needed here.
              -1, // Not needed here.
              undefined,
              PID
            ),
          ];
        })
      );
    })();

    this.tableView.reload();
  }

  //
  // @implements TableViewControllerDelegate.
  //
  rowCount(): number {
    return this.openOrders.length;
  }

  //
  // @implements TableViewControllerDelegate.
  //
  viewForRow(row: number): View {
    const oo = this.openOrders[row];
    const marketAddr = oo.market.toString();
    const market = this.marketMap.get(marketAddr);
    if (!market) {
      throw new Error("market not found");
    }

    const rowView = new View();

    const addressView = new TypographyView();
    const pubkeyStr = oo.address.toString();
    addressView.setText(
      `${pubkeyStr.slice(0, 3)}...${pubkeyStr.slice(pubkeyStr.length - 3)}`
    );
    addressView.setStyle({
      fontSize: "12px",
    });

    const amountsView = new TypographyView();
    amountsView.setText(
      // @ts-ignore
      JSON.stringify(market._decoded)
    );

    rowView.addSubview(addressView);
    rowView.addSubview(amountsView);

    return rowView;
  }
}

const PID = new PublicKey("9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin");

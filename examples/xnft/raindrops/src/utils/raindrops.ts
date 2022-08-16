import { BN, Program as AnchorProgram, web3 } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { Program } from "@raindrop-studios/sol-kit";
import {
  State,
  ItemProgram,
  Idl,
  // PlayerProgram,
} from "@raindrops-protocol/raindrops";
import { TokenAccountInfo } from "../types";
import { TOKEN_PROGRAM_ID, AccountLayout } from "@solana/spl-token";

import { Items } from "../mock-data/items";

export type RaindropsItem = {
  item: State.Item.Item;
  token: TokenAccountInfo;
  metadata?: any;
};

export type RaindropsItemClass = {
  item: State.Item.ItemClass;
  token: TokenAccountInfo;
  metadata?: any;
};

export const getItemProgram = async (): Promise<ItemProgram> => {
  const config: Program.ProgramConfig = {
    asyncSigning: true,
    provider: window.xnft,
    idl: Idl.Item,
  };

  return ItemProgram.getProgramWithConfig(ItemProgram, config);
};

// const getPlayerProgram = () => {
//   const config: Program.ProgramConfig = {
//     asyncSigning: true,
//     provider: window.xnft.provider,
//     idl: ProgramIdl,
//   };
//   return PlayerProgram.getProgramWithConfig(
//     PlayerProgram,
//     config,
//   );
// }

export const hasRaindropsItem = async (mint: PublicKey): Promise<boolean> => {
  return !!(await getRaindropsItem(mint));
};

export const getRaindropsItem = async (
  mint: PublicKey
): Promise<State.Item.Item | undefined> => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  console.log("getRaindropsItem", Items[0]);
  return Items[0];
  //   item: Items[0],
  //   token: AccountLayout.decode((await window.xnft.provider.connection.getAccountInfo(new PublicKey("zEpDPXKCBX2KaX82s7FxwWCgfQeX5Ejv82xMr5ag2nx"))).data)
  // };
};

// export const getRaindropsItem = async (
//   mint: PublicKey
// ): Promise<State.Item.ItemClass | State.Item.Item | undefined> => {
//   console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
//   const itemProgram = await getItemProgram();
//   const item = await itemProgram.fetchItemClass(mint, new BN(0));
//   console.log("Raindrops Fetched");
//   return item?.object;
// };

// export const hasRaindropsPlayer = async (mint: PublicKey) => {

// }

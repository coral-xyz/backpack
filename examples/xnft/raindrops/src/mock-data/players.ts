import { State } from "@raindrops-protocol/raindrops";
import { web3 } from "@project-serum/anchor";
import { Items } from "./items";

export class Player {
  id: web3.PublicKey;
  name: string;
  mint: web3.PublicKey;
  level: number;
  hp: number;
  backpack: State.Item.Item[];
  equippedItems: State.Item.Item[];

  constructor(args) {
    this.id = args.id;
    this.name = args.name;
    this.mint = args.mint;
    this.level = args.level;
    this.hp = args.hp;
    this.backpack = args.backpack;
    this.equippedItems = args.equippedItems;
  }
}

export const Players: Player[] = [
  new Player({
    id: new web3.PublicKey("3dyJfoReKCSyajwjBzoPFbJBXWrh2ZhxeEKigfsMNnmB"),
    name: "Player 1 Panda",
    mint: new web3.PublicKey("81zXokTaD3nEtGNe1krvENpcCkBEAKrkniRsUZhSXgvB"),
    level: 1,
    hp: 20,
    backpack: [Items[0]],
    equippedItems: [Items[1]],
  }),
  new Player({
    id: new web3.PublicKey("3dyJfoReKCSyajwjBzoPFbJBXWrh2ZhxeEKigfsMNnmB"),
    name: "Player 2 Panda",
    mint: new web3.PublicKey("GCCJfGvcnA8E91rTvGBpyCTgBwidG2zJzqfQyDphoXCj"),
    level: 3,
    hp: 100,
    backpack: [Items[0], Items[1]],
    equippedItems: [],
  }),
];

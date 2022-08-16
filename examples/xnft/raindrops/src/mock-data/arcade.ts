import { web3 } from "@project-serum/anchor";

export class ArcadeGame {
  id: web3.PublicKey;
  name: string;
  description: string;
  image: string;

  constructor(
    id: web3.PublicKey,
    name: string,
    description: string,
    image: string
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.image = image;
  }
}

export const ArcadeGames: ArcadeGame[] = [
  new ArcadeGame(
    new web3.PublicKey("DUzYHuaLAHNKSR27FvuFYCH1oJwPKHmKwcjPnyHJ3eKA"),
    "Shoot Trash",
    "Shoot pit's trash into a dumpster to win $RAIN",
    "https://bafkreiagydwgbxtjaaow33fb6ptsmmbrda7klg5madrj3ek2jdh5wxcsou.ipfs.dweb.link/"
  ),
  new ArcadeGame(
    new web3.PublicKey("ELyx1Aka4KvzRAEoAAn2ccNvL58DFsGUbygLh7Q4gvdv"),
    "Trash with Frens",
    "Beat each other with shovels and collect falling $RAIN",
    "https://degentrashpanda.com/characters/GameImage.png"
  ),
  new ArcadeGame(
    new web3.PublicKey("2Ky8kC7FQNk8u73XQsbP4nDEgEp4DLT3UiWFSn9UrdL6"),
    "Degen man",
    "Collect the energy pellets and avoid the degens",
    "https://appstoidewp.com/wp-content/uploads/2020/03/DownloadPACMAN1.jpg"
  ),
  new ArcadeGame(
    new web3.PublicKey("2Ky8kC7FQNk8u73XQsbP4nDEgEp4DLT3UiWFSn9UrdL8"),
    "Flappy Trash",
    "Fly as a piece of trash, don't hit the tubes",
    "https://www.robomodo.com/wp-content/uploads/2019/12/Flappy-Bird-Gameplay.jpg"
  ),
];

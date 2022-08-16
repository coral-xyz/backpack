import { web3 } from "@project-serum/anchor";

export class FeedItem {
  id: web3.PublicKey;
  title: string;
  description: string;
  image: string;

  constructor(
    id: web3.PublicKey,
    name: string,
    description: string,
    image: string
  ) {
    this.id = id;
    this.title = name;
    this.description = description;
    this.image = image;
  }
}

export const Feed: FeedItem[] = [
  new FeedItem(
    new web3.PublicKey("DUzYHuaLAHNKSR27FvuFYCH1oJwPKHmKwcjPnyHJ3eKA"),
    "Item Upgrade",
    "You upgraded a item in shoot trash",
    "https://bafkreiagydwgbxtjaaow33fb6ptsmmbrda7klg5madrj3ek2jdh5wxcsou.ipfs.dweb.link/"
  ),
  new FeedItem(
    new web3.PublicKey("2Ky8kC7FQNk8u73XQsbP4nDEgEp4DLT3UiWFSn9UrdL6"),
    "Player Upgrade",
    "Your degen man upgraded their level to 4",
    "https://appstoidewp.com/wp-content/uploads/2020/03/DownloadPACMAN1.jpg"
  ),
  new FeedItem(
    new web3.PublicKey("ELyx1Aka4KvzRAEoAAn2ccNvL58DFsGUbygLh7Q4gvdv"),
    "Won match",
    "You won a match in trash with frens",
    "https://degentrashpanda.com/characters/GameImage.png"
  ),
  new FeedItem(
    new web3.PublicKey("DUzYHuaLAHNKSR27FvuFYCH1oJwPKHmKwcjPnyHJ3eKA"),
    "Level Completed",
    "You completed another level in shoot trash",
    "https://bafkreiagydwgbxtjaaow33fb6ptsmmbrda7klg5madrj3ek2jdh5wxcsou.ipfs.dweb.link/"
  ),
  new FeedItem(
    new web3.PublicKey("ELyx1Aka4KvzRAEoAAn2ccNvL58DFsGUbygLh7Q4gvdv"),
    "New Friend",
    "You made a new friend in trash with frens",
    "https://degentrashpanda.com/characters/GameImage.png"
  ),
  new FeedItem(
    new web3.PublicKey("2Ky8kC7FQNk8u73XQsbP4nDEgEp4DLT3UiWFSn9UrdL6"),
    "Player Upgrade",
    "Your degen man upgraded their level to 3",
    "https://appstoidewp.com/wp-content/uploads/2020/03/DownloadPACMAN1.jpg"
  ),
  new FeedItem(
    new web3.PublicKey("ELyx1Aka4KvzRAEoAAn2ccNvL58DFsGUbygLh7Q4gvdv"),
    "New Friend",
    "You made a new friend in trash with frens",
    "https://degentrashpanda.com/characters/GameImage.png"
  ),
  new FeedItem(
    new web3.PublicKey("ELyx1Aka4KvzRAEoAAn2ccNvL58DFsGUbygLh7Q4gvdv"),
    "New Friend",
    "You made a new friend in trash with frens",
    "https://degentrashpanda.com/characters/GameImage.png"
  ),
];

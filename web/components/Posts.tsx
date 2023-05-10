/* eslint-disable max-len */
import Image from 'next/legacy/image';

const cardArticles = [
  {
    title: 'Coindesk',
    subtitle: 'Heavy Demand for Madlads NFT Breaks Internet, Delays Mint',
    image:
      'https://coindesk.com/resizer/aHFTwpGDGmuTTf1AC6ueAsmJv1w=/2112x1188/filters:quality(80):format(webp)/cloudfront-us-east-1.images.arcpublishing.com/coindesk/FB4VEP3MIBCLNHHOHFWHRHCP2A.jpg',
    href: 'https://coindesk.com/web3/2023/04/21/heavy-demand-for-madlads-nft-breaks-internet-delays-mint/'
  },
  {
    title: 'Fortune',
    subtitle:
      'Solana has outperformed Bitcoin and Ethereum since January thanks in part to Mad Lads NFTs',
    image: 'https://content.fortune.com/wp-content/uploads/2023/04/Coins-Solana-6.jpg?w=1440&q=75',
    href: 'https://fortune.com/crypto/2023/04/28/solana-cryptocurrency-outperforms-bitcoin-and-ethereum-ytd-mad-lads/'
  },
  {
    title: 'Blockworks',
    subtitle: 'So You Know What NFTs Are, but How About xNFTs?',
    image:
      'https://blockworks.co/_next/image?url=https%3A%2F%2Fblockworks-co.imgix.net%2Fwp-content%2Fuploads%2F2023%2F05%2FNFT-royalties.jpg&w=1920&q=75',
    href: 'https://blockworks.co/news/you-know-xnfts'
  },
  {
    title: 'NFTnow',
    subtitle: 'What Are xNFTs? The New Type of Token Behind the Mad Lads Craze',
    image: 'https://nftnow.com/wp-content/uploads/2023/04/Mad-Lads-NFTs-1-1536x1023.jpg',
    href: 'https://nftnow.com/features/what-are-xnfts-the-new-type-of-token-behind-the-mad-lads-craze/'
  },
  {
    title: 'Decrypt',
    subtitle: 'Solana NFTs Come to Portfolio App Floor Amid Mad Lads Boom',
    image:
      'https://img.decrypt.co/insecure/rs:fit:1536:0:0:0/plain/https://cdn.decrypt.co/wp-content/uploads/2023/01/floor-app-2023-gID_7.png@webp',
    href: 'https://decrypt.co/137634/solana-nfts-come-to-portfolio-app-floor-amid-mad-lads-boom'
  }
];

const textArticles = [
  {
    title: 'Fortune Crypto',
    link: 'https://fortune.com/crypto/2022/09/28/coral-raises-20-million-ftx-ventures-jump-crypto-backpack-wallet/'
  },
  {
    title: 'TechCrunch',
    link: 'https://techcrunch.com/2022/09/28/solana-coral-ftx-jump-crypto-iphone-web3-apps-xnfts/'
  },
  {
    title: 'CoinDesk',
    link: 'https://www.coindesk.com/business/2022/09/28/ftx-ventures-jump-crypto-lead-20m-fundraise-for-executable-nft-wallet/'
  },
  {
    title: 'The Block',
    link: 'https://www.theblock.co/post/173345/anchor-creator-coral-raises-20-million-as-it-debuts-wallet-product'
  }
];

export default function Posts() {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xl font-bold tracking-wide text-zinc-50">News</h2>
      <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-2">
        {cardArticles.map((article, index) => (
          <a
            target="_blank"
            rel="noreferrer"
            href={article.href}
            key={index}
            className="grid grid-cols-1 items-center justify-around gap-6 rounded-xl
              bg-zinc-800 py-8 px-8 hover:scale-[1.02] hover:bg-[#27272A]/70 md:grid-cols-2 md:gap-2"
          >
            <div className="flex flex-col">
              <div className="text-xl tracking-wide text-zinc-50">{article.title}</div>
              <div className="mt-4 text-sm text-zinc-300">{article.subtitle}</div>
              {/* <a
                target="_blank"
                rel="noreferrer"
                href={article.href}
                className="item-center mt-4 w-40 rounded-xl bg-zinc-100 py-3 px-2 text-center
                  font-medium transition delay-100 ease-in-out hover:scale-110"
              >
                Read Article
              </a> */}
            </div>
            <Image
              alt="article-img"
              className="rounded-xl bg-cover"
              src={article.image}
              width={500}
              height={340}
            />
          </a>
        ))}
      </div>
      <h2 className="my-4 text-xl font-bold tracking-wide text-zinc-50">More Press</h2>
      <ul className="ml-2 list-disc">
        {textArticles.map((article, index) => (
          <li className="text-xs text-zinc-300" key={index}>
            {article.title}:{' '}
            <a href={article.link} target="_blank" rel="noreferrer" className="underline">
              {article.link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

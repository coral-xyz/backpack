/* eslint-disable max-len */
import { ArrowRightIcon } from '@heroicons/react/outline';
import Image from 'next/legacy/image';

const articles = [
  {
    title: 'CoinDesk',
    subtitle: 'Heavy Demand for Madlads NFT Breaks Internet, Delays Mint',
    image:
      'https://www.coindesk.com/resizer/aHFTwpGDGmuTTf1AC6ueAsmJv1w=/2112x1188/filters:quality(80):format(webp)/cloudfront-us-east-1.images.arcpublishing.com/coindesk/FB4VEP3MIBCLNHHOHFWHRHCP2A.jpg',
    href: 'https://www.coindesk.com/web3/2023/04/21/heavy-demand-for-madlads-nft-breaks-internet-delays-mint'
  },
  {
    title: 'Fortune Crypto',
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
    title: 'NFTNow',
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
  },
  {
    title: 'PR Newswire',
    subtitle:
      'Backpack Launches First Solana xNFT Collection, Breaking Records and Showcasing an Opportunity for NFTs to Be More Than JPEGs and Reach a Mass Consumer Audience',
    image:
      'https://www.coindesk.com/resizer/aHFTwpGDGmuTTf1AC6ueAsmJv1w=/2112x1188/filters:quality(80):format(webp)/cloudfront-us-east-1.images.arcpublishing.com/coindesk/FB4VEP3MIBCLNHHOHFWHRHCP2A.jpg',
    href: 'https://www.prnewswire.com/news-releases/backpack-launches-first-solana-xnft-collection-breaking-records-and-showcasing-an-opportunity-for-nfts-to-be-more-than-jpegs-and-reach-a-mass-consumer-audience-301807194.html'
  }
];

export default function Posts() {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xl font-bold tracking-wide text-zinc-50">News</h2>
      <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-2">
        {articles.map((article, index) => (
          <div
            key={index}
            className="grid grid-cols-1 items-center justify-around gap-6 rounded-xl bg-zinc-800
              py-8 px-8 md:grid-cols-2 md:gap-2"
          >
            <div className="flex flex-col pr-1">
              <div className="text-xl tracking-wide text-zinc-50">{article.title}</div>
              <div className="mt-4 text-sm text-zinc-300">{article.subtitle}</div>
              <a target="_blank" rel="noreferrer" href={article.href}>
                <span className="mt-4 flex cursor-pointer items-center gap-2 font-medium text-zinc-50">
                  Read <ArrowRightIcon strokeWidth={3} height={14} />
                </span>
              </a>
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
              className="rounded-xl bg-cover object-cover"
              src={article.image}
              width={500}
              height={340}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

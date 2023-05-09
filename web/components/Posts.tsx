/* eslint-disable max-len */
import { ArrowRightIcon } from '@heroicons/react/outline';
import Image from 'next/legacy/image';

const articles = [
  {
    title: 'Fortune Crypto',
    subtitle:
      "An 'iPhone launch moment for Web3'? Coral raises $20M from FTX Ventures and Jump Crypto to build Backpack",
    image:
      'https://content.fortune.com/wp-content/uploads/2022/09/Armani-Ferrante-Coral.jpg?w=1440&q=75',
    href: 'https://fortune.com/crypto/2022/09/28/coral-raises-20-million-ftx-ventures-jump-crypto-backpack-wallet/'
  },
  {
    title: 'TechCrunch',
    subtitle:
      "Solana developer platform Coral raises $20M led by FTX, Jump Crypto to build web3's iPhone",
    image:
      'https://techcrunch.com/wp-content/uploads/2022/09/photo_2022-09-27_08-15-34.jpg?w=1390&crop=1',
    href: 'https://techcrunch.com/2022/09/28/solana-coral-ftx-jump-crypto-iphone-web3-apps-xnfts/'
  },
  {
    title: 'CoinDesk',
    subtitle: 'FTX Ventures, Jump Crypto Lead $20M Fundraise for Executable NFT Wallet',
    image:
      'https://techcrunch.com/wp-content/uploads/2022/09/photo_2022-09-27_08-15-34.jpg?w=1390&crop=1',
    href: 'https://www.coindesk.com/business/2022/09/28/ftx-ventures-jump-crypto-lead-20m-fundraise-for-executable-nft-wallet/'
  },
  {
    title: 'The Block',
    subtitle: 'Anchor creator Coral raises $20 million led by FTX Ventures and Jump Crypto',
    image: 'https://www.tbstat.com/wp/uploads/2022/08/20220822_Funding_Generic1-1200x675.jpg',
    href: 'https://www.theblock.co/post/173345/anchor-creator-coral-raises-20-million-as-it-debuts-wallet-product'
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
            <div className="flex flex-col">
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
              className="rounded-xl bg-cover"
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

import { memo } from 'react';
import Image from 'next/legacy/image';

const data = [
  {
    image: '/brands/solana.svg',
    url: 'https://solana.com/'
  },
  {
    image: '/brands/jump.svg',
    url: 'https://jumpcrypto.com/'
  },

  {
    image: '/brands/wormhole.svg',
    url: 'https://wormholenetwork.com/'
  },
  {
    image: '/brands/pyth.svg',
    url: 'https://pyth.network/'
  },
  {
    image: '/brands/multicoin.svg',
    url: 'https://multicoin.capital/'
  },
  {
    image: '/brands/anagram.svg',
    url: 'https://anagram.xyz/'
  }
];

function Partners() {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="flex text-xl font-extrabold tracking-wide text-zinc-50">Partners</h2>
      <div className="flex flex-col gap-10 sm:flex-row">
        <ul role="list" className="grid w-full grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((item, index) => {
            if (item.url === '') {
              return (
                <li key={index} className="col-span-1 flex justify-center  bg-zinc-800 py-8">
                  <Image src={item.image} alt="" height={49} width={160} />
                </li>
              );
            } else {
              return (
                <a key={index} href={item.url} target="_blank" rel="noreferrer">
                  <li
                    className="col-span-1 flex justify-center  bg-zinc-800
                   py-8 hover:bg-zinc-600"
                  >
                    <Image src={item.image} alt="" height={49} width={160} />
                  </li>
                </a>
              );
            }
          })}
        </ul>
      </div>
    </div>
  );
}

export default memo(Partners);

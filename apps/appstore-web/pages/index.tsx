import useXNFTs from '../hooks/useXNFTs';
import dynamic from 'next/dynamic';
import AppPlaceholder from '../components/gallery/app-placeholder';
import { useAnchorWallet } from '@solana/wallet-adapter-react';

const Posts = dynamic(() => import('../components/gallery/posts'));
const App = dynamic(() => import('../components/gallery/app'), { loading: AppPlaceholder });

function Home() {
  const anchorWallet = useAnchorWallet();
  const { xnfts, isLoading } = useXNFTs();

  console.log('xnfts', xnfts);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 md:px-10">
      <div>
        <Posts />
      </div>
      <div className="md:px-10">
        <h2 className="text-lg font-medium tracking-wide text-gray-300">Recommended Apps</h2>
        <ul
          role="list"
          className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
        >
          {isLoading ? (
            <AppPlaceholder />
          ) : (
            <>
              {xnfts.map((xnft, index) => (
                <App
                  key={index}
                  iconUrl={xnft.metadata.properties.icon}
                  name={xnft.metadata.name}
                  description={xnft.metadata.description}
                  publicKey={xnft.accounts.masterMetadata.toBase58()}
                />
              ))}
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Home;

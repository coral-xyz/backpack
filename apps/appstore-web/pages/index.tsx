import useXNFTs from '../hooks/useXNFTs';
import dynamic from 'next/dynamic';

const Posts = dynamic(() => import('../components/gallery/posts'));
const App = dynamic(() => import('../components/gallery/app'));
const AppPlaceholder = dynamic(() => import('../components/gallery/app-placeholder'));

function Home() {
  const { xnfts, isLoading } = useXNFTs();

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
                  iconUrl={xnft.data.metadata.properties.icon}
                  name={xnft.data.name}
                  description={xnft.data.metadata.description}
                />
              ))}
              {xnfts.map((xnft, index) => (
                <App
                  key={index}
                  iconUrl={xnft.data.metadata.properties.icon}
                  name={xnft.data.name}
                  description={xnft.data.metadata.description}
                />
              ))}
              {xnfts.map((xnft, index) => (
                <App
                  key={index}
                  iconUrl={xnft.data.metadata.properties.icon}
                  name={xnft.data.name}
                  description={xnft.data.metadata.description}
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

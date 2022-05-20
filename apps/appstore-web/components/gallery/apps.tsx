import { memo } from 'react';
import App from './app';

function Apps({ xnfts }: AppsProps) {
  return (
    <>
      <h2 className="text-lg font-medium tracking-wide text-gray-300">Recommended Apps</h2>
      <ul
        role="list"
        className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
      >
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
      </ul>
    </>
  );
}

interface AppsProps {
  xnfts: any[];
}

export default memo(Apps);

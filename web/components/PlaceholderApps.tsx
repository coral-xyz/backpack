/* eslint-disable max-len */
import { memo } from 'react';

import App from './AppNoLink';

const apps = [
  { iconUrl: '/brands/mango.png', name: 'Mango' },
  { iconUrl: '/brands/Anchor.jpg', name: 'Anchor' },
  { iconUrl: '/brands/degods.png', name: 'DeGods' },
  { iconUrl: '/brands/pyth.jpg', name: 'Pyth' },
  { iconUrl: '/brands/magic-eden.jpg', name: 'Magic Eden' },
  { iconUrl: '/brands/Raindrops.png', name: 'Raindrops' },
  { iconUrl: '/brands/Psyoptions.png', name: 'PsyOptions' },
  { iconUrl: '/brands/wormhole.jpg', name: 'Wormhole' },
  { iconUrl: '/brands/serum.jpg', name: 'Serum' },
  { iconUrl: '/brands/aurory.jpg', name: 'Aurory' },
  { iconUrl: '/brands/defiland.jpg', name: 'DeFi Land' }
];

function PlaceholderApps() {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="flex text-xl font-extrabold tracking-wide text-zinc-50">
        xNFTs{' '}
        <span className="align-center ml-3 flex w-max rounded-full bg-teal-900 px-3 py-1 text-sm text-teal-400">
          soon
        </span>
      </h2>
      <ul role="list" className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
        {apps.map((item, index) => (
          <li key={index} className="col-span-1 rounded-lg bg-zinc-800 py-2">
            <App name={item.name} iconUrl={item.iconUrl} key={index} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default memo(PlaceholderApps);

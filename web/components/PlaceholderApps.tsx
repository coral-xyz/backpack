/* eslint-disable max-len */
import { Children, memo } from 'react';
import { placeHolderAppsList } from '../constant';
import PlaceHolderAppCard from './Cards/PlaceHolderAppCard';

function PlaceholderApps() {
  return (
    <section>
      <div className="backpack-container flex flex-col gap-6">
        <h2 className="relative grid text-center text-4xl font-bold text-gray-800 dark:text-white md:text-5xl">
          xNFTs
          <span className="py- 1 absolute ml-48 flex w-max rotate-45 justify-self-center rounded-full bg-red-400/10 px-3 text-sm text-red-800">
            soon
          </span>
        </h2>
        <ul role="list" className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
          {Children.toArray(
            placeHolderAppsList.map(app => (
              <li className="col-span-1 rounded-lg border border-zinc-600 bg-zinc-800 py-2 shadow transition-transform hover:-translate-y-1 hover:shadow-2xl">
                <PlaceHolderAppCard name={app.name} iconUrl={app.iconUrl} />
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}

export default memo(PlaceholderApps);

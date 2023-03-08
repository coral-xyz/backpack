import { memo } from 'react';
import Image from 'next/legacy/image';

function CoralFooter() {
  return (
    <div className="flex justify-between px-4 sm:px-4 lg:px-8">
      <div className="flex flex-col justify-between">
        <p className="text-zinc-400">
          Built by{' '}
          <a className="text-zinc-50" href="https://coral.community">
            Coral
          </a>
        </p>
      </div>
      <div className="flex">
        <div className="flex flex-col justify-center">
          <a
            href="https://twitter.com/0xCoral"
            className="mr-6 flex h-full w-5 flex-col justify-center"
            target="_blank"
            rel="noreferrer"
          >
            <Image alt="twitter-icon" src="/brands/twitter.png" width="20px" height="20px" />
          </a>
        </div>
        <a
          href="https://github.com/coral-xyz"
          className="flex w-5 flex-col justify-center"
          target="_blank"
          rel="noreferrer"
        >
          <Image alt="icon-github" src="/brands/github.png" width="20px" height="20px" />
        </a>
      </div>
    </div>
  );
}

export default memo(CoralFooter);

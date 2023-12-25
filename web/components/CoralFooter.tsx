import { memo } from 'react';
import Image from 'next/legacy/image';
import Link from 'next/link';

function CoralFooter() {
  return (
    <div className="flex justify-between px-4 sm:px-4 lg:px-8">
      <div className="flex flex-col justify-between">
        {/*
        <p className="text-zinc-400">
          Built by{' '}
          <a className="text-zinc-50" href="https://coral.community">
            Coral
          </a>
        </p>
			*/}
      </div>
      <div className="flex items-center gap-4">
        <Link className="text-sm text-zinc-400" href="/terms" target="_blank">
          Terms
        </Link>
        <Link className="text-sm text-zinc-400" href="/privacy" target="_blank">
          Privacy
        </Link>
        <div className="flex flex-col justify-center">
          <a
            href="https://twitter.com/0xCoral"
            className="flex h-full w-5 flex-col justify-center"
            target="_blank"
            rel="noreferrer"
          >
            <Image alt="twitter-icon" src="/brands/twitter.png" width={20} height={20} />
          </a>
        </div>
        <a
          href="https://github.com/coral-xyz"
          className="flex w-5 flex-col justify-center"
          target="_blank"
          rel="noreferrer"
        >
          <Image alt="icon-github" src="/brands/github.png" width={20} height={20} />
        </a>
      </div>
    </div>
  );
}

export default memo(CoralFooter);

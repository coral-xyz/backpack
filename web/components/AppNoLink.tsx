import { memo } from 'react';
import Image from 'next/legacy/image';

function AppNoLink({ iconUrl, name }: AppNoLinkPros) {
  return (
    <div className="flex w-full rounded-md px-5 py-2">
      <div className="flex flex-row items-center gap-3">
        <div className="h-10 w-10">
          <Image
            alt="logo"
            src={iconUrl}
            blurDataURL="/brands/aurory.jpg" //TODO: fix me
            placeholder="blur"
            quality={50}
            width="100px"
            height="100px"
            style={{ borderRadius: '4px' }}
          />
        </div>

        <div className="text-lg font-medium tracking-wide text-zinc-50">{name}</div>
      </div>
    </div>
  );
}

interface AppNoLinkPros {
  iconUrl: string;
  name: string;
}

export default memo(AppNoLink);

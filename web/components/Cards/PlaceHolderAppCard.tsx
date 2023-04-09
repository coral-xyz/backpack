import Image from 'next/image';
import React from 'react';

type placeHolderAppType = {
  iconUrl: string;
  name: string;
};

const PlaceHolderAppCard = ({ iconUrl, name }: placeHolderAppType) => {
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
            width={100}
            height={100}
            className="rounded-md"
          />
        </div>

        <div className="text-lg font-medium tracking-wide text-zinc-50">{name}</div>
      </div>
    </div>
  );
};

export default PlaceHolderAppCard;

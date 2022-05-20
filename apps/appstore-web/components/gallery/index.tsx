import { memo } from 'react';
import Apps from './apps';
import Posts from './posts';

function Gallery({ xnfts }: GalleryProps) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 md:px-10">
      <div>
        <Posts />
      </div>
      <div className="md:px-10">
        <Apps xnfts={xnfts} />
      </div>
    </div>
  );
}

interface GalleryProps {
  xnfts: any[];
}

export default memo(Gallery);

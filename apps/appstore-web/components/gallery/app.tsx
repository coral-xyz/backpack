import { memo } from 'react';
import Image from 'next/image';

function App({ iconUrl, name, description }: AppPros) {
  return (
    <li className="col-span-1 flex gap-2 rounded-md shadow-sm">
      <div className="h-10 w-10 rounded border border-gray-500">
        <Image src={iconUrl} width="100px" height="100px" />
      </div>

      <div>
        <div className="font-medium capitalize tracking-wide text-gray-50">{name}</div>
        <div className="text-xs tracking-wide text-gray-300">{description}</div>
      </div>
    </li>
  );
}

interface AppPros {
  iconUrl: string;
  name: string;
  description: string;
}

export default memo(App);

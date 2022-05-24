import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';

function App({ iconUrl, name, description, publicKey }: AppPros) {
  return (
    <Link href={`/app/${publicKey}`}>
      <li className="col-span-1 flex gap-2 rounded-md p-2 shadow-sm hover:bg-gray-600">
        <div className="h-10 w-10 rounded-full border border-gray-500">
          <Image alt="logo" src={iconUrl} width="100px" height="100px" />
        </div>

        <div>
          <div className="font-medium capitalize tracking-wide text-gray-50">{name}</div>
          <div className="text-xs tracking-wide text-gray-300">{description}</div>
        </div>
      </li>
    </Link>
  );
}

interface AppPros {
  iconUrl: string;
  name: string;
  description: string;
  publicKey: string;
}

export default memo(App);

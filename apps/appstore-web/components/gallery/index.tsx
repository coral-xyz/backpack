import { DotsVerticalIcon } from '@heroicons/react/solid';
import { memo } from 'react';
import Image from 'next/image';

const projects = [
  { name: 'Graph API', initials: 'GA', href: '#', members: 16, bgColor: 'bg-pink-600' },
  { name: 'Component Design', initials: 'CD', href: '#', members: 12, bgColor: 'bg-purple-600' },
  { name: 'Templates', initials: 'T', href: '#', members: 16, bgColor: 'bg-yellow-500' },
  { name: 'React Components', initials: 'RC', href: '#', members: 8, bgColor: 'bg-green-500' }
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Gallery({ xnfts }: GalleryProps) {
  console.log(xnfts);
  return (
    <div className="mx-auto max-w-7xl px-10">
      <h2 className="text-lg font-medium tracking-wide text-gray-300">
        Great new Apps and Updates
      </h2>
      <ul
        role="list"
        className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
      >
        {xnfts.map((xnft, index) => (
          <li key={index} className="col-span-1 flex rounded-md shadow-sm">
            <Image src={xnft.data.metadata.properties.icon} width="100px" height="100px" />
            <div className="text-gray-200">{xnft.data.name}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface GalleryProps {
  xnfts: any[];
}

export default memo(Gallery);

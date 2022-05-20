import { memo } from 'react';

const tabs = [{ name: 'Upload App' }, { name: 'Review & Mint' }];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Tabs({ selected }: TabsProps) {
  return (
    <nav className="flex justify-around space-x-4" aria-label="Tabs">
      {tabs.map(tab => (
        <span
          key={tab.name}
          className={classNames(
            tab.name === selected ? 'text-red-400' : 'text-gray-400',
            'rounded-md px-3 py-2 font-medium tracking-wide'
          )}
          aria-current={tab.name === selected ? 'page' : undefined}
        >
          {tab.name}
        </span>
      ))}
    </nav>
  );
}

interface TabsProps {
  selected: string;
}

export default memo(Tabs);

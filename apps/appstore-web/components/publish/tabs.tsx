import { memo } from "react";

const tabs = [{ name: "Deploy App" }, { name: "Review & Mint" }];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Tabs({ selected, setSelected }: TabsProps) {
  return (
    <nav className="flex justify-around space-x-4" aria-label="Tabs">
      {tabs.map((tab) => (
        <button
          key={tab.name}
          onClick={() => setSelected(tab.name)}
          className={classNames(
            tab.name === selected
              ? "text-red-400"
              : "text-gray-400 hover:text-gray-500",
            "rounded-md px-3 py-2 font-medium tracking-wide"
          )}
          aria-current={tab.name === selected ? "page" : undefined}
        >
          {tab.name}
        </button>
      ))}
    </nav>
  );
}

interface TabsProps {
  selected: string;
  setSelected: any;
}

export default memo(Tabs);

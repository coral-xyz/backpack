import { useState } from 'react';
import { RadioGroup } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/solid';

const options = [
  {
    id: 1,
    title: 'Unlimited Supply'
  },
  {
    id: 2,
    title: 'Fixed Supply'
  }
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Radio() {
  const [selectedOption, setSelectedOption] = useState(options[0]);

  return (
    <RadioGroup value={selectedOption} onChange={setSelectedOption}>
      <RadioGroup.Label className="block text-sm  font-medium tracking-wide text-gray-300">
        How many editions would you like to mint?
      </RadioGroup.Label>

      <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
        {options.map(option => (
          <RadioGroup.Option
            key={option.id}
            value={option}
            disabled={option.id === 2}
            className={({ checked, active }) =>
              classNames(
                checked ? 'border-transparent' : 'border-gray-900',
                active ? 'border-indigo-500 ring-2 ring-indigo-500' : '',
                'relative flex cursor-pointer rounded-lg border bg-gray-900 p-4 shadow-sm focus:outline-none'
              )
            }
          >
            {({ checked, active }) => (
              <>
                <span className="flex flex-1">
                  <span className="flex flex-col">
                    <RadioGroup.Label as="span" className="block text-sm font-medium text-gray-300">
                      {option.title}
                    </RadioGroup.Label>
                    <RadioGroup.Description
                      as="span"
                      className="mt-1 flex items-center text-sm text-gray-500"
                    >
                      {option.id === 2 && (
                        <div className="mt-1">
                          <input
                            type="text"
                            disabled={option.id === 2}
                            id="supply"
                            placeholder="0"
                            className="block w-full rounded-md border-gray-900 
                            bg-gray-600 text-sm text-gray-300 disabled:blur-sm"
                          />
                        </div>
                      )}
                    </RadioGroup.Description>
                  </span>
                </span>
                <CheckCircleIcon
                  className={classNames(!checked ? 'invisible' : '', 'h-5 w-5 text-indigo-600')}
                  aria-hidden="true"
                />
                <span
                  className={classNames(
                    active ? 'border' : 'border-2',
                    checked ? 'border-indigo-500' : 'border-transparent',
                    'pointer-events-none absolute -inset-px rounded-lg'
                  )}
                  aria-hidden="true"
                />
              </>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  );
}

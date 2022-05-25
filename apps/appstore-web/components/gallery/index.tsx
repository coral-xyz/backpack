import { DotsVerticalIcon } from '@heroicons/react/solid';
import { memo } from 'react';

const projects = [
  { name: 'Graph API', initials: 'GA', href: '#', members: 16, bgColor: 'bg-pink-600' },
  { name: 'Component Design', initials: 'CD', href: '#', members: 12, bgColor: 'bg-purple-600' },
  { name: 'Templates', initials: 'T', href: '#', members: 16, bgColor: 'bg-yellow-500' },
  { name: 'React Components', initials: 'RC', href: '#', members: 8, bgColor: 'bg-green-500' }
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Gallery() {
  return (
    <div className="mx-auto max-w-7xl px-10">
      <h2 className="text-lg font-medium tracking-wide text-gray-300">
        Great new Apps and Updates
      </h2>
      <ul
        role="list"
        className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
      >
        {projects.map(project => (
          <li key={project.name} className="col-span-1 flex rounded-md shadow-sm">
            <div
              className={classNames(
                project.bgColor,
                'flex w-16 flex-shrink-0 items-center justify-center rounded-l-md text-sm' +
                  ' font-medium text-white'
              )}
            >
              {project.initials}
            </div>
            <div
              className="flex flex-1 items-center justify-between truncate rounded-r-md border-t
            border-r border-b border-gray-200 bg-white"
            >
              <div className="flex-1 truncate px-4 py-2 text-sm">
                <a href={project.href} className="font-medium text-gray-900 hover:text-gray-600">
                  {project.name}
                </a>
                <p className="text-gray-500">{project.members} Members</p>
              </div>
              <div className="flex-shrink-0 pr-2">
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full
                  bg-white bg-transparent text-gray-400 hover:text-gray-500 focus:outline-none
                  focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span className="sr-only">Open options</span>
                  <DotsVerticalIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default memo(Gallery);

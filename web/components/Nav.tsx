import { Disclosure, Menu } from '@headlessui/react';
import { ExternalLinkIcon, MenuIcon, XIcon } from '@heroicons/react/outline';
import Image from 'next/legacy/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { memo } from 'react';

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ');
}

export const mainMenu = [
  {
    title: 'Exchange',
    path: 'https://backpack.exchange'
  },
  {
    title: 'Downloads',
    path: '/downloads'
  }
];

function Nav() {
  const router = useRouter();

  return (
    <>
      <Disclosure as="nav" className="bg-zinc-900">
        {({ open }) => (
          <>
            <div className=" mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
              <div className="relative flex h-16 items-center justify-between">
                <div className="flex items-center gap-4 px-2 lg:px-0">
                  {/* Logo */}
                  <Link href="/">
                    <div className="flex">
                      <Image alt="Backpack" src="/backpack.svg" width={150} height={50} />
                    </div>
                  </Link>
                </div>

                {/* Navigation */}
                <div className="hidden justify-center gap-2 lg:flex">
                  {mainMenu.map((item, index) => {
                    if (item.title === 'Exchange') {
                      return (
                        <a
                          key={index}
                          href={item.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={classNames(
                            'flex gap-1 px-3 py-2 text-sm font-medium tracking-wide text-zinc-100',
                            router.pathname === item.path && 'rounded-lg bg-zinc-900'
                          )}
                        >
                          {item.title}
                        </a>
                      );
                    } else if (item.title === 'Support') {
                      return (
                        <Menu key={index} as="div" className="relative">
                          <Menu.Button className="px-3 py-2 text-sm font-medium tracking-wide text-zinc-100">
                            {item.title}
                          </Menu.Button>
                          <Menu.Items className="absolute left-0 mt-2 rounded-lg bg-[#27272A] px-3 text-sm font-medium tracking-wide text-zinc-100">
                            {[
                              { title: 'Discord', link: 'http://discord.gg/backpack' },
                              { title: 'User Guides', link: 'https://help.backpack.app' }
                            ].map(item => (
                              <Menu.Item key={item.title}>
                                <div className="w-24 py-2">
                                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                                    {item.title}
                                  </a>
                                </div>
                              </Menu.Item>
                            ))}
                          </Menu.Items>
                        </Menu>
                      );
                    } else {
                      return (
                        <Link key={index} href={item.path}>
                          <button
                            className={classNames(
                              'flex gap-1 px-3 py-2 text-sm font-medium',
                              'tracking-wide text-zinc-100',
                              router.pathname === item.path && 'rounded-lg bg-zinc-900'
                            )}
                          >
                            {item.title}
                            {item.title === 'For Developers' && (
                              <ExternalLinkIcon className="g-5 w-5" />
                            )}
                          </button>
                        </Link>
                      );
                    }
                  })}
                </div>

                {/* Actions */}
                <div className="flex flex-row items-center gap-4 lg:hidden">
                  {/* Mobile menu button */}
                  <div className="flex">
                    <Disclosure.Button
                      className="inline-flex items-center
                justify-center rounded-md p-2 text-zinc-100 hover:bg-zinc-700
                hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    >
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="lg:hidden">
              <div className="space-y-1 px-2 pt-2 pb-3">
                {mainMenu.map((item, index) => (
                  <Link key={index} href={item.path}>
                    <button
                      className={classNames(
                        'flex gap-1 px-3 py-2 font-medium tracking-wide text-zinc-100',
                        router.pathname === item.path && 'rounded-lg bg-zinc-900'
                      )}
                    >
                      {item.title}
                      {item.title === 'For Developers' && <ExternalLinkIcon className="g-5 w-5" />}
                    </button>
                  </Link>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </>
  );
}

export default memo(Nav);

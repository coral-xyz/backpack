import { Fragment, memo, useEffect } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { SearchIcon } from '@heroicons/react/solid';
import { MenuIcon, XIcon } from '@heroicons/react/outline';
import Image from 'next/image';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { signIn, signOut, useSession } from 'next-auth/react';
import bs58 from 'bs58';
import Link from 'next/link';

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ');
}

function Nav() {
  const { publicKey, signMessage, connected } = useWallet();
  const { data: session, status } = useSession();
  const { setVisible } = useWalletModal();

  useEffect(() => {
    async function login() {
      const nonce = await fetchNonce();
      const message = `Sign this message for authenticating with your wallet. Nonce: ${nonce}`;
      const encodedMessage = new TextEncoder().encode(message);
      try {
        const signedMessage = await signMessage(encodedMessage);

        signIn('credentials', {
          publicKey: publicKey,
          signature: bs58.encode(signedMessage),
          callbackUrl: `${window.location.origin}/`
        });
      } catch (error) {
        console.error(error);
      }
    }

    if (connected && status === 'unauthenticated') login();
  }, [status, publicKey, connected, signMessage]);

  async function fetchNonce() {
    const response = await fetch('/api/login');
    if (response.status != 200) throw new Error('nonce could not be retrieved');
    const { nonce } = await response.json();

    return nonce;
  }

  return (
    <Disclosure as="nav" className="bg-gray-900">
      {({ open }) => (
        <>
          <div className=" mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="flex items-center px-2 lg:px-0">
                {/* Logo */}
                <Link href="/">
                  <div className="flex-shrink-0">
                    <Image src="/logo.png" width="120px" height="40px" />
                  </div>
                </Link>
              </div>
              {/* Search  */}
              <div className="flex flex-1 justify-center px-2 lg:ml-6">
                <div className="w-full max-w-lg">
                  <label htmlFor="search" className="sr-only">
                    Search
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <SearchIcon className="h-5 w-5 text-gray-100" aria-hidden="true" />
                    </div>
                    <input
                      id="search"
                      name="search"
                      className="block w-full rounded-md border border-transparent bg-gray-700 py-2 pl-10 pr-3 leading-5 text-gray-50 placeholder-gray-400 focus:border-white focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-white sm:text-sm"
                      placeholder="Search"
                      type="search"
                    />
                  </div>
                </div>
              </div>

              {/* Menu Options*/}
              <div className="hidden lg:ml-6 lg:block">
                <div className="flex space-x-4">
                  {/* Current: "bg-gray-900 text-white", Default: "text-gray-50 hover:bg-gray-700 hover:text-white" */}
                  <a className="cursor-no-drop rounded-md px-3 py-2 text-sm font-medium text-gray-50 hover:bg-gray-700 hover:text-white">
                    Get Backpack
                  </a>
                  <a className="cursor-no-drop rounded-md px-3 py-2 text-sm font-medium text-gray-50 hover:bg-gray-700 hover:text-white">
                    Docs
                  </a>
                  {status === 'unauthenticated' && (
                    <button
                      type="button"
                      className="items-center rounded-md bg-gradient-to-r from-pink-400 to-yellow-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-green-500 hover:to-blue-500"
                      onClick={() => setVisible(true)}
                    >
                      Login with Wallet
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="flex lg:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-100 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>

              {status === 'authenticated' && (
                <div className="hidden lg:ml-4 lg:block">
                  <div className="flex items-center">
                    {/* Auth or Profile */}
                    <Menu as="div" className="relative ml-4 flex-shrink-0">
                      <div>
                        <Menu.Button className="flex rounded-full bg-gray-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                          <span className="sr-only">Open user menu</span>
                          <img
                            className="h-8 w-8 rounded-full"
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                            alt=""
                          />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href="/publish"
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm text-gray-900'
                                )}
                              >
                                Publish a new App
                              </Link>
                            )}
                          </Menu.Item>
                          {/* TODO: fix css */}
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => signOut()}
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block min-w-full px-4 py-2 text-left text-sm text-gray-900'
                                )}
                              >
                                Sign out
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Disclosure.Panel className="lg:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3">
              {/* Current: "bg-gray-900 text-white", Default: "text-gray-50 hover:bg-gray-700 hover:text-white" */}
              <Disclosure.Button
                as="a"
                className="block cursor-no-drop rounded-md px-3 py-2 text-base font-medium text-gray-50 hover:bg-gray-700 hover:text-white"
              >
                Get Backpack
              </Disclosure.Button>
              <Disclosure.Button
                as="a"
                className="block cursor-no-drop rounded-md px-3 py-2 text-base font-medium text-gray-50 hover:bg-gray-700 hover:text-white"
              >
                Docs
              </Disclosure.Button>
            </div>
            <div className="border-t border-gray-700 pt-4 pb-3">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                  />
                </div>
                <div className="ml-3">
                  {/* TODO: Address */}
                  <div className="text-base font-medium text-white">Tom Cook</div>
                  <div className="text-sm font-medium text-gray-100">tom@example.com</div>
                </div>
              </div>
              <div className="mt-3 space-y-1 px-2">
                <Disclosure.Button
                  as="a"
                  href="#"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-100 hover:bg-gray-700 hover:text-white"
                >
                  My Applications
                </Disclosure.Button>
                <Disclosure.Button
                  as="a"
                  href="#"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-100 hover:bg-gray-700 hover:text-white"
                >
                  Sign out
                </Disclosure.Button>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

export default memo(Nav);

/* eslint-disable max-len */

import Image from 'next/image';
import Link from 'next/link';
import { footerLinks } from '../../constant';
import { Children } from 'react';

const Footer = () => {
  return (
    <footer className="rounded-tr-xl border-t-[1px] border-t-zinc-100 bg-white pt-8 pb-8 dark:border-t-zinc-700 dark:bg-zinc-800">
      <div className="backpack-container">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <Link href="/" aria-label="logo" className="flex items-center space-x-2">
              <Image
                className="brightness-0 dark:brightness-100"
                alt="Backpack"
                src="/backpack.svg"
                width={150}
                height={50}
              />
            </Link>

            <div className="mt-8 flex items-center gap-4">
              <Link
                href="https://twitter.com"
                target="_blank"
                className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
                <span className="sr-only">Twitter page</span>
              </Link>

              <Link
                href="https://twitter.com"
                target="_blank"
                className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="sr-only">GitHub account</span>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 sm:gap-6">
            {Children.toArray(
              footerLinks.map(footerLink => (
                <div>
                  <h2 className="mb-6 text-sm font-semibold uppercase text-gray-900 dark:text-white">
                    {footerLink.title}
                  </h2>

                  <ul className="font-medium text-gray-600 dark:text-gray-400">
                    {Children.toArray(
                      footerLink.children.map(link => (
                        <li className="mb-4">
                          <Link href={link.to} className="hover:underline hover:underline-offset-4">
                            {link.name}
                          </Link>
                        </li>
                      ))
                    )}
                  </ul>
                  {/* <ul className="font-medium text-gray-600 dark:text-gray-400">
                    <li className="mb-4">
                      <Link
                        href="/privacy-policy"
                        className="hover:underline hover:underline-offset-4"
                      >
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/terms-and-conditions"
                        className="hover:underline hover:underline-offset-4"
                      >
                        Terms &amp; Conditions
                      </Link>
                    </li>
                  </ul> */}
                </div>
              ))
            )}
            {/* <div>
              <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
                Follow us
              </h2>
              <ul className="font-medium text-gray-600 dark:text-gray-400">
                <li className="mb-4">
                  <a href="https://github.com/themesberg/flowbite" className="hover:underline ">
                    Github
                  </a>
                </li>
                <li>
                  <a href="https://discord.gg/4eeurUVvTy" className="hover:underline">
                    Discord
                  </a>
                </li>
              </ul>
            </div> */}
            {/* <div>
              <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
                Legal
              </h2>
              <ul className="font-medium text-gray-600 dark:text-gray-400">
                <li className="mb-4">
                  <Link href="/privacy-policy" className="hover:underline hover:underline-offset-4">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-and-conditions"
                    className="hover:underline hover:underline-offset-4"
                  >
                    Terms &amp; Conditions
                  </Link>
                </li>
              </ul>
            </div> */}
          </div>
        </div>
        <hr className="my-6 border-zinc-200 dark:border-zinc-700 sm:mx-auto lg:my-8" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-zinc-500 dark:text-zinc-400 sm:text-center">
            © {new Date().getFullYear()}{' '}
            <a
              href="https://backpack.app"
              className="hover:text-primary hover:underline hover:underline-offset-4"
            >
              Backpack
            </a>
            . All Rights Reserved. {'  '}
          </span>
          <div className="mt-4 flex space-x-6 sm:mt-0 sm:justify-center">
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              Made with ❤ by{' '}
              <Link href="https://zia.vennsol.pk" target="_blank" className="b-link tracking-wide">
                ZiaCodes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

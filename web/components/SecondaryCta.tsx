/* eslint-disable max-len */
import Link from 'next/link';
import { memo } from 'react';

function SecondaryCta({ publishDisable }: SecondaryCtaProps) {
  return (
    <div>
      <div className="mx-auto lg:py-20">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
          <span className="block font-extrabold text-zinc-50">App Developer?</span>
          <span className="block font-extrabold text-teal-500">
            Publish your app as an executable xNFT App.
          </span>
          <span className="block text-lg text-zinc-400">(Devs, Discord coming soon.)</span>
        </h2>
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-md shadow">
            {publishDisable ? (
              <div className="inline-flex">
                <a
                  className="inline-flex cursor-not-allowed items-center justify-center rounded-md
                 border border-transparent bg-teal-600 px-5 py-3 text-base font-medium text-zinc-50
                  hover:bg-teal-700"
                >
                  Get started
                </a>
              </div>
            ) : (
              <Link
                href="/publish"
                className="inline-flex items-center justify-center rounded-md border
                 border-transparent bg-teal-600 px-5 py-3 text-base font-medium text-zinc-50
                  hover:bg-teal-700"
              >
                Get started
              </Link>
            )}
          </div>
          <div className="ml-3 inline-flex">
            <a
              className="inline-flex cursor-not-allowed items-center justify-center rounded-md
                border border-transparent bg-teal-100 px-5 py-3 text-base font-medium text-teal-700
                hover:bg-teal-200"
            >
              Docs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SecondaryCtaProps {
  publishDisable: boolean;
}

export default memo(SecondaryCta);

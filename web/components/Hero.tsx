/* eslint-disable max-len */
import { Children, memo, useState } from 'react';
import { CheckIcon } from '@heroicons/react/outline';

import { subscribe } from '../lib/mailchimp';
import Image from 'next/image';
import { heroFeatures, partners } from '../constant';
import PartnerCard from './Cards/PartnerCard';
import Link from 'next/link';
import HeroFeatureCard from './Cards/HeroFeatureCard';

function Hero() {
  const [email, setEmail] = useState<string>('');
  const [subscribed, setSubscribed] = useState<boolean>(false);

  async function subscribeEmail(e) {
    e.preventDefault();

    // TODO: improve error handling
    try {
      await subscribe(email);
      setEmail('');
      setSubscribed(true);
    } catch {
      // Pass
    }
  }

  return (
    <section className="relative">
      <div
        aria-hidden="true"
        className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20"
      >
        <div className="h-56 bg-gradient-to-br from-primary to-primary blur-[106px] dark:from-primary"></div>
        <div className="from-primary-400 h-32 bg-gradient-to-r to-primary blur-[106px] dark:to-primary"></div>
      </div>
      <div className="backpack-container">
        <div className="relative ml-auto pt-36">
          <div className="mx-auto text-center lg:w-2/3">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white md:text-6xl xl:text-7xl">
              xNFT Nest: Your Digital{' '}
              <span className="text-primary dark:text-primary">Treasures Home!</span>
            </h1>
            <p className="text-gray-700 dark:text-gray-300">
              Welcome to NFT Nest - your xNFTs&#39; perfect home! Store, manage, and showcase your
              digital art and collectibles with ease. Join us now and unlock the full potential of
              your digital treasures!
            </p>
            <div className="mt-16 flex flex-wrap justify-center gap-y-4 gap-x-6">
              <Link href="#" className="b-btn-primary">
                <span className="relative text-base font-semibold text-white">Get started</span>
              </Link>
              <Link href="#" className="b-btn-secondary">
                <span className="relative text-base font-semibold text-primary dark:text-white">
                  Learn more
                </span>
              </Link>
            </div>

            <div
              className="relative my-8 hidden justify-center md:flex"
              data-aos="zoom-y-out"
              data-aos-delay="450"
            >
              <div className="relative flex flex-col justify-center">
                {/* You can Replace the Frame with your own */}
                <Image
                  className="z-20 mx-auto h-[630px] sm:h-[670px]"
                  src="/mockup.png"
                  width="615"
                  height="590"
                  alt="Hero"
                />
                <video
                  width="368"
                  height="432"
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster="/screenshot.png"
                  className="rouneded-xl absolute inset-0 top-[40px] mx-auto"
                >
                  <source src="/videos/backpack-safari.mp4" type="video/mp4" />
                </video>
              </div>
            </div>

            <div className="mt-16 hidden justify-between border-y border-zinc-100 py-8 dark:border-zinc-800 sm:flex">
              {Children.toArray(heroFeatures.map(feature => <HeroFeatureCard {...feature} />))}
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6">
          {Children.toArray(partners.map(partner => <PartnerCard {...partner} />))}
        </div>
      </div>
    </section>
  );
}

export default memo(Hero);

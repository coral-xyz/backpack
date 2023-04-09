/* eslint-disable max-len */
import { Children, FormEvent, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { HeroFeatureCard, HeroSection } from '../components';
import { heroFeatures } from '../constant';
import { subscribe } from '../lib/mailchimp';

const GetStarted = dynamic(() => import('../components/GetStarted'));
const Blog = dynamic(() => import('../components/Blog'));
const PlaceholderApps = dynamic(() => import('../components/PlaceholderApps'));

export default function Home() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  async function subscribeEmail(e: FormEvent) {
    e.preventDefault();

    try {
      const response = await subscribe(email);
      setEmail('');
      setSubscribed(true);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <HeroSection
        title={
          <>
            xNFT Nest: Your Digital{' '}
            <span className="text-primary dark:text-primary">Treasures Home!</span>
          </>
        }
      >
        <p className="text-gray-700 dark:text-gray-300">
          Welcome to NFT Nest - your xNFTs&#39; perfect home! Store, manage, and showcase your
          digital art and collectibles with ease. Join us now and unlock the full potential of your
          digital treasures!
        </p>

        {/* Other Option when you website is Ready */}
        {/* <div className="flex flex-wrap justify-center mt-16 gap-y-4 gap-x-6">
          <Link href="#" className="b-btn-primary">
            <span className="relative text-base font-semibold text-white">Get started</span>
          </Link>
          <Link href="#" className="b-btn-secondary">
            <span className="relative text-base font-semibold text-primary dark:text-white">
              Learn more
            </span>
          </Link>
        </div> */}
        <form onSubmit={subscribeEmail} className="my-4 grid w-full justify-center lg:w-auto">
          <div className="mx-auto flex max-w-xs flex-col justify-center sm:max-w-md sm:flex-row lg:mx-0">
            <input
              type="email"
              className="placeholder-zinc form-input mb-2 w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-400 px-4 py-3 text-white focus:border-zinc-600 focus:ring-red-500 dark:bg-zinc-700 sm:mb-0 sm:mr-2"
              placeholder="John@gmail.com"
              value={email}
              name="email"
              autoComplete="email"
              onChange={e => setEmail(e.target.value)}
              aria-label="John@gmail.com"
            />
            <button
              type="submit"
              className="relative w-full rounded-lg bg-primary px-6 py-3 text-white transition duration-300 before:inset-0 hover:scale-105 active:scale-95 active:duration-75 sm:w-max"
            >
              Subscribe
            </button>
          </div>
          {/* <p className="mt-3 text-sm text-gray-400">Thanks for subscribing!</p> */}
          <p className="mx-auto mt-3 max-w-xs text-left text-sm text-gray-400 sm:max-w-md sm:flex-row lg:mx-0">
            {subscribed
              ? "You'll be the first to know when Backpack is ready."
              : 'We hate spam as much as you do.'}
          </p>
        </form>

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
      </HeroSection>
      <GetStarted />
      <Blog />
      <PlaceholderApps />
    </>
  );
}

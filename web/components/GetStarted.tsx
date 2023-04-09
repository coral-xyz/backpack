/* eslint-disable max-len */
import Image from 'next/image';

const GetStarted = () => {
  return (
    <section className="relative py-16">
      <div
        aria-hidden="true"
        className="absolute inset-0 m-auto grid h-max w-full grid-cols-2 -space-x-52 opacity-40 dark:opacity-20"
      >
        <div className="h-56 bg-gradient-to-br from-primary to-purple-400 blur-[106px] dark:from-primary"></div>
        <div className="h-32 bg-gradient-to-r from-zinc-600 to-orange-300 blur-[106px] dark:to-primary"></div>
      </div>
      <div className="backpack-container">
        <div className="relative">
          <div className="flex items-center justify-center -space-x-2">
            <Image
              loading="lazy"
              width="400"
              height="400"
              src="/avatar.webp"
              alt="member photo"
              className="h-8 w-8 rounded-full object-cover"
            />
            <Image
              loading="lazy"
              width="200"
              height="200"
              src="/avatar-2.webp"
              alt="member photo"
              className="h-12 w-12 rounded-full object-cover"
            />
            <Image
              loading="lazy"
              width="200"
              height="200"
              src="/avatar-3.webp"
              alt="member photo"
              className="z-[1] h-16 w-16 rounded-full object-cover"
            />
            <Image
              loading="lazy"
              width="200"
              height="200"
              src="/avatar-4.webp"
              alt="member photo"
              className="relative h-12 w-12 rounded-full object-cover"
            />
            <Image
              loading="lazy"
              width="200"
              height="200"
              src="/avatar-1.webp"
              alt="member photo"
              className="h-8 w-8 rounded-full object-cover"
            />
          </div>
          <div className="m-auto mt-6 space-y-6 md:w-8/12 lg:w-7/12">
            <h1 className="text-center text-4xl font-bold text-gray-800 dark:text-white md:text-5xl">
              Get Started now
            </h1>
            <p className="text-center text-xl text-gray-600 dark:text-gray-300">
              Be part of millions people around the world using tailus in modern User Interfaces.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="#" className="b-btn-primary">
                <span className="dark:text-dark relative text-base font-semibold text-white">
                  Get Started
                </span>
              </a>
              <a href="#" className="b-btn-secondary">
                <span className="relative text-base font-semibold text-primary dark:text-white">
                  More about
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GetStarted;

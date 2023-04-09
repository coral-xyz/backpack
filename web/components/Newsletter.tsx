/* eslint-disable max-len */
import React from 'react';

function Newsletter() {
  return (
    <section>
      <div className="backpack-container">
        <div className="pb-12 md:pb-20">
          <div
            className="relative overflow-hidden rounded-3xl border border-zinc-100 bg-white bg-opacity-50 px-8 py-10 shadow-zinc-600/10 dark:border-zinc-700 dark:bg-zinc-800 md:py-16 md:px-12"
            data-aos="zoom-y-out"
          >
            <div
              className="pointer-events-none absolute bottom-0 right-0 hidden lg:block"
              aria-hidden="true"
            >
              <svg width="428" height="328" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient
                    cx="35.542%"
                    cy="34.553%"
                    fx="35.542%"
                    fy="34.553%"
                    r="96.031%"
                    id="ni-a"
                  >
                    <stop stopColor="#e2e2e2" offset="0%" />
                    <stop stopColor="#855454" offset="44.317%" />
                    <stop stopColor="#b84545" offset="100%" />
                  </radialGradient>
                </defs>
                <g fill="none" fillRule="evenodd">
                  <g fill="#f09c9c">
                    <ellipse fillOpacity=".04" cx="185" cy="15.576" rx="16" ry="15.576" />
                    <ellipse fillOpacity=".24" cx="100" cy="68.402" rx="24" ry="23.364" />
                    <ellipse fillOpacity=".12" cx="29" cy="251.231" rx="29" ry="28.231" />
                    <ellipse fillOpacity=".64" cx="29" cy="251.231" rx="8" ry="7.788" />
                    <ellipse fillOpacity=".12" cx="342" cy="31.303" rx="8" ry="7.788" />
                    <ellipse fillOpacity=".48" cx="62" cy="126.811" rx="2" ry="1.947" />
                    <ellipse fillOpacity=".12" cx="78" cy="7.072" rx="2" ry="1.947" />
                    <ellipse fillOpacity=".64" cx="185" cy="15.576" rx="6" ry="5.841" />
                  </g>
                  <circle fill="url(#ni-a)" cx="276" cy="237" r="200" />
                </g>
              </svg>
            </div>

            <div className="relative flex flex-col items-center justify-between lg:flex-row">
              <div className="text-center lg:max-w-xl lg:text-left">
                <h3 className="mb-2 text-3xl font-bold text-gray-800 dark:text-white md:text-4xl">
                  Want Backpack news and updates?
                </h3>
                <p className="mb-6 text-lg text-gray-300">
                  Sign up for our Substack to stay up to date.
                </p>

                <form className="w-full lg:w-auto">
                  <div className="mx-auto flex max-w-xs flex-col justify-center sm:max-w-md sm:flex-row lg:mx-0">
                    <input
                      type="email"
                      className="form-input mb-2 w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-400 px-4 py-3 text-white placeholder-white focus:border-zinc-600 focus:ring-red-500 dark:bg-zinc-700 sm:mb-0 sm:mr-2"
                      placeholder="Your email…"
                      aria-label="Your email…"
                    />
                    <button className="relative w-full rounded-lg bg-primary px-6 py-3 text-white transition duration-300 before:inset-0 hover:scale-105 active:scale-95 active:duration-75 sm:w-max">
                      Subscribe
                    </button>
                  </div>
                  {/* <p className="mt-3 text-sm text-gray-400">Thanks for subscribing!</p> */}
                  <p className="mx-auto mt-3 max-w-xs text-left text-sm text-gray-400 sm:max-w-md sm:flex-row lg:mx-0">
                    We hate spam as much as you do.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Newsletter;

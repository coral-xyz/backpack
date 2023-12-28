import { memo } from 'react';
// import { CheckIcon } from '@heroicons/react/outline';

// import { subscribe } from '../lib/mailchimp';
import { mainMenu } from './Nav';

function Hero() {
  // const [email, setEmail] = useState<string>('');
  // const [subscribed, setSubscribed] = useState<boolean>(false);

  // async function subscribeEmail(e) {
  //   e.preventDefault();

  //   // TODO: improve error handling
  //   try {
  //     await subscribe(email);
  //     setEmail('');
  //     setSubscribed(true);
  //   } catch {
  //     // Pass
  //   }
  // }

  return (
    <div className="pb-20 sm:pb-48 lg:pb-20">
      <div className="mx-auto max-w-7xl lg:px-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div
            className="col-span-3 mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 sm:text-center
              lg:col-span-2 lg:flex lg:items-center lg:px-0 lg:text-left"
          >
            <div className="lg:py-24">
              <h1
                className="mt-4 text-4xl font-extrabold tracking-tight
                  text-zinc-50 sm:mt-5 sm:text-6xl lg:mt-6 xl:text-6xl"
              >
                <span className="block font-extrabold text-zinc-50">A home for your xNFTs.</span>
              </h1>
              <p
                className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-xl
                  lg:text-lg xl:text-xl"
              >
                Coming soon on mobile.
              </p>
              <div className="mt-5 sm:mt-8">
                <div>
                  <a
                    className="block flex h-12 w-28 flex-row items-center justify-center
                    rounded-md bg-indigo-500 font-medium text-indigo-50 shadow
                    hover:bg-indigo-600"
                    href={mainMenu.find(m => m.title === 'Downloads').path}
                    rel="noopener noreferrer"
                  >
                    Downloads
                  </a>
                </div>
                {/* <form onSubmit={subscribeEmail} className="sm:mx-auto sm:max-w-xl lg:mx-0">
                  <div className="sm:flex">
                    <div className="min-w-0 flex-1">
                      <label htmlFor="email" className="sr-only">
                        Email address
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="block w-full rounded-md border-0 px-4 py-3
                            text-base text-gray-900 placeholder-gray-500"
                        autoComplete="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <button
                        type="submit"
                        className="block flex h-12 w-28 flex-row items-center justify-center
                        rounded-md bg-indigo-500 font-medium text-indigo-50 shadow
                        hover:bg-indigo-600"
                      >
                        {subscribed ? <CheckIcon className="h-8 w-8" /> : 'Notify me'}
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-300 sm:mt-2">
                    {subscribed
                      ? 'You’ll be the first to know when Backpack is ready.'
                      : 'We hate spam as much as you do.'}
                  </p>
                </form> */}
              </div>
            </div>
          </div>
          <div className="mt-12 -mb-16 flex items-center justify-center sm:-mb-48 lg:m-0">
            <div className="flex h-fit w-fit justify-center">
              <video
                width="100%"
                height="100%"
                autoPlay
                loop
                muted
                playsInline
                poster="/screenshot.png"
                className="rounded-xl  shadow-xl shadow-teal-600/30"
              >
                <source src="/videos/backpack-safari.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(Hero);
